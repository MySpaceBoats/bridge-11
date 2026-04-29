import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Contribution } from './contribution.entity';
import { User } from './user.entity';

export enum PaymentStatus {
  PROMISED = 'promised',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('contribution_payments')
export class ContributionPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contributionId: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  promisedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PROMISED })
  status: PaymentStatus;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Contribution, (c) => c.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contributionId' })
  contribution: Contribution;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
