import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { Event } from './event.entity';
import { User } from './user.entity';
import { ContributionPayment } from './contribution-payment.entity';

@Entity('contributions')
export class Contribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column({ nullable: true })
  eventId: string;

  @Column()
  createdById: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetAmount: number;

  @Column({ nullable: true })
  currency: string;

  @ManyToOne(() => Family, (f) => f.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => Event, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => ContributionPayment, (p) => p.contribution, { cascade: true })
  payments: ContributionPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
