import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Poll } from './poll.entity';
import { User } from './user.entity';

@Entity('poll_votes')
@Unique(['pollId', 'userId', 'optionIndex'])
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pollId: string;

  @Column()
  userId: string;

  @Column()
  optionIndex: number;

  @ManyToOne(() => Poll, (p) => p.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll: Poll;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
