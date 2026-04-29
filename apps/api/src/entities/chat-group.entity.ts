import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { User } from './user.entity';
import { Message } from './message.entity';

export enum GroupType {
  GENERAL = 'general',
  BRANCH = 'branch',
}

@Entity('chat_groups')
export class ChatGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: GroupType, default: GroupType.GENERAL })
  type: GroupType;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => Family, (f) => f.chatGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => Message, (m) => m.group, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
