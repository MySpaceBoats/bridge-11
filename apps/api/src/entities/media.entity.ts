import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Album } from './album.entity';
import { User } from './user.entity';
import { Family } from './family.entity';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column({ nullable: true })
  albumId: string;

  @Column()
  uploadedById: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.PHOTO })
  type: MediaType;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  size: number;

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => Album, (a) => a.media, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'albumId' })
  album: Album;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
