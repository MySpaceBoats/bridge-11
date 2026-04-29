import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Family } from './family.entity';

export enum FamilyRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('family_members')
@Unique(['userId', 'familyId'])
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  familyId: string;

  @Column({ type: 'enum', enum: FamilyRole, default: FamilyRole.MEMBER })
  role: FamilyRole;

  @ManyToOne(() => User, (u) => u.familyMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Family, (f) => f.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @CreateDateColumn()
  joinedAt: Date;
}
