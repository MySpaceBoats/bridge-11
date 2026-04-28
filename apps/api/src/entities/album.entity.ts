import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Family } from './family.entity';
import { Event } from './event.entity';
import { User } from './user.entity';
import { Media } from './media.entity';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column({ nullable: true })
  eventId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  coverUrl: string;

  @Column()
  createdById: string;

  @ManyToOne(() => Family, (f) => f.albums, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => Event, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => Media, (m) => m.album, { cascade: true })
  media: Media[];

  @CreateDateColumn()
  createdAt: Date;
}
