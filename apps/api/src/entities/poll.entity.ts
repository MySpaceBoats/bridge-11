import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { User } from './user.entity';
import { PollVote } from './poll-vote.entity';

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column()
  createdById: string;

  @Column()
  question: string;

  @Column('jsonb')
  options: string[];

  @Column({ type: 'timestamptz', nullable: true })
  endsAt: Date;

  @Column({ default: false })
  allowMultiple: boolean;

  @ManyToOne(() => Family, (f) => f.polls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => PollVote, (v) => v.poll, { cascade: true })
  votes: PollVote[];

  @CreateDateColumn()
  createdAt: Date;
}
