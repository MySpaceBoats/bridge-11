import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';

interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async create(userId: string, dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create({ userId, ...dto });
    return this.notifRepo.save(notif);
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async markRead(userId: string, notifId: string): Promise<void> {
    await this.notifRepo.update({ id: notifId, userId }, { read: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, read: false }, { read: true });
  }

  async countUnread(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, read: false } });
  }
}
