import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FamilyMember } from './family-member.entity';
import { Event } from './event.entity';
import { ChatGroup } from './chat-group.entity';
import { Poll } from './poll.entity';
import { Contribution } from './contribution.entity';
import { Album } from './album.entity';

@Entity('families')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => FamilyMember, (fm) => fm.family, { cascade: true })
  members: FamilyMember[];

  @OneToMany(() => Event, (e) => e.family)
  events: Event[];

  @OneToMany(() => ChatGroup, (cg) => cg.family)
  chatGroups: ChatGroup[];

  @OneToMany(() => Poll, (p) => p.family)
  polls: Poll[];

  @OneToMany(() => Contribution, (c) => c.family)
  contributions: Contribution[];

  @OneToMany(() => Album, (a) => a.family)
  albums: Album[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
