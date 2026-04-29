import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Poll } from '../../entities/poll.entity';
import { PollVote } from '../../entities/poll-vote.entity';
import { FamilyMember } from '../../entities/family-member.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Poll, PollVote, FamilyMember]),
    NotificationsModule,
  ],
  providers: [PollsService],
  controllers: [PollsController],
  exports: [PollsService],
})
export class PollsModule {}
