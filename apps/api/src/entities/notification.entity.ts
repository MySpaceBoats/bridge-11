import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  NEW_EVENT = 'new_event',
  EVENT_REMINDER = 'event_reminder',
  NEW_MESSAGE = 'new_message',
  NEW_POLL = 'new_poll',
  POLL_RESULT = 'poll_result',
  NEW_CONTRIBUTION = 'new_contribution',
  FAMILY_INVITE = 'family_invite',
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ default: false })
  read: boolean;

  @ManyToOne(() => User, (u) => u.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
