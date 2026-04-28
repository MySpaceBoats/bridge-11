import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

export enum ParticipationStatus {
  GOING = 'going',
  NOT_GOING = 'not_going',
  MAYBE = 'maybe',
}

@Entity('event_participations')
@Unique(['eventId', 'userId'])
export class EventParticipation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: ParticipationStatus, default: ParticipationStatus.MAYBE })
  status: ParticipationStatus;

  @ManyToOne(() => Event, (e) => e.participations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  respondedAt: Date;
}
