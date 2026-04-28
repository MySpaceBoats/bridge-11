import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { EventParticipation } from '../../entities/event-participation.entity';
import { CreateEventDto, RespondEventDto } from './dto/create-event.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';
import { FamilyMember } from '../../entities/family-member.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(EventParticipation) private participationRepo: Repository<EventParticipation>,
    @InjectRepository(FamilyMember) private memberRepo: Repository<FamilyMember>,
    private notificationsService: NotificationsService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepo.create({
      familyId,
      createdById: userId,
      ...dto,
    });
    const saved = await this.eventRepo.save(event);

    // Notify all family members
    const members = await this.memberRepo.find({ where: { familyId } });
    await Promise.all(
      members
        .filter((m) => m.userId !== userId)
        .map((m) =>
          this.notificationsService.create(m.userId, {
            type: NotificationType.NEW_EVENT,
            title: 'New Event',
            body: `A new event "${dto.title}" has been created`,
            data: { eventId: saved.id, familyId },
          }),
        ),
    );

    return saved;
  }

  async findByFamily(familyId: string): Promise<Event[]> {
    return this.eventRepo.find({
      where: { familyId },
      relations: ['createdBy', 'participations', 'participations.user'],
      order: { startDate: 'ASC' },
    });
  }

  async findById(eventId: string): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['createdBy', 'participations', 'participations.user'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async respond(eventId: string, userId: string, dto: RespondEventDto): Promise<EventParticipation> {
    let participation = await this.participationRepo.findOne({
      where: { eventId, userId },
    });
    if (participation) {
      participation.status = dto.status;
    } else {
      participation = this.participationRepo.create({ eventId, userId, status: dto.status });
    }
    return this.participationRepo.save(participation);
  }

  async delete(eventId: string): Promise<void> {
    await this.eventRepo.delete(eventId);
  }

  async getUpcoming(familyId: string, limit = 5): Promise<Event[]> {
    return this.eventRepo.find({
      where: { familyId },
      order: { startDate: 'ASC' },
      take: limit,
    });
  }
}
