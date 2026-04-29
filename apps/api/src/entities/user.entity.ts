import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { FamilyMember } from './family-member.entity';
import { Message } from './message.entity';
import { Post } from './post.entity';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => FamilyMember, (fm) => fm.user)
  familyMemberships: FamilyMember[];

  @OneToMany(() => Message, (m) => m.sender)
  messages: Message[];

  @OneToMany(() => Post, (p) => p.author)
  posts: Post[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
