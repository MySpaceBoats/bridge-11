import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../../entities/poll.entity';
import { PollVote } from '../../entities/poll-vote.entity';
import { FamilyMember } from '../../entities/family-member.entity';
import { CreatePollDto, VotePollDto } from './dto/poll.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/notification.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll) private pollRepo: Repository<Poll>,
    @InjectRepository(PollVote) private voteRepo: Repository<PollVote>,
    @InjectRepository(FamilyMember) private memberRepo: Repository<FamilyMember>,
    private notificationsService: NotificationsService,
  ) {}

  async create(familyId: string, userId: string, dto: CreatePollDto): Promise<Poll> {
    const poll = this.pollRepo.create({ familyId, createdById: userId, ...dto });
    const saved = await this.pollRepo.save(poll);

    const members = await this.memberRepo.find({ where: { familyId } });
    await Promise.all(
      members
        .filter((m) => m.userId !== userId)
        .map((m) =>
          this.notificationsService.create(m.userId, {
            type: NotificationType.NEW_POLL,
            title: 'New Poll',
            body: `Vote: ${dto.question}`,
            data: { pollId: saved.id, familyId },
          }),
        ),
    );

    return saved;
  }

  async findByFamily(familyId: string): Promise<Poll[]> {
    return this.pollRepo.find({
      where: { familyId },
      relations: ['createdBy', 'votes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(pollId: string): Promise<Poll & { results: { option: string; count: number }[] }> {
    const poll = await this.pollRepo.findOne({
      where: { id: pollId },
      relations: ['createdBy', 'votes', 'votes.user'],
    });
    if (!poll) throw new NotFoundException('Poll not found');

    const results = poll.options.map((option, index) => ({
      option,
      count: poll.votes.filter((v) => v.optionIndex === index).length,
    }));

    return { ...poll, results };
  }

  async vote(pollId: string, userId: string, dto: VotePollDto): Promise<PollVote> {
    const poll = await this.pollRepo.findOne({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');

    if (!poll.allowMultiple) {
      const existing = await this.voteRepo.findOne({ where: { pollId, userId } });
      if (existing) throw new ConflictException('Already voted');
    }

    const vote = this.voteRepo.create({ pollId, userId, optionIndex: dto.optionIndex });
    return this.voteRepo.save(vote);
  }

  async delete(pollId: string): Promise<void> {
    await this.pollRepo.delete(pollId);
  }
}
