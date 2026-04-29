import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { User } from './user.entity';
import { EventParticipation } from './event-participation.entity';

export enum EventType {
  PUNCTUAL = 'punctual',
  RECURRING = 'recurring',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column()
  createdById: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'enum', enum: EventType, default: EventType.PUNCTUAL })
  type: EventType;

  @Column({ nullable: true })
  recurrenceRule: string;

  @ManyToOne(() => Family, (f) => f.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => EventParticipation, (ep) => ep.event, { cascade: true })
  participations: EventParticipation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
