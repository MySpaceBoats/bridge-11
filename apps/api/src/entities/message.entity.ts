import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { ChatGroup } from './chat-group.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @Column()
  senderId: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @ManyToOne(() => ChatGroup, (g) => g.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: ChatGroup;

  @ManyToOne(() => User, (u) => u.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @CreateDateColumn()
  createdAt: Date;
}
