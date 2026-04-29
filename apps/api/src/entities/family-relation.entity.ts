import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Family } from './family.entity';

export enum RelationType {
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  COUSIN = 'cousin',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  UNCLE_AUNT = 'uncle_aunt',
  NEPHEW_NIECE = 'nephew_niece',
  OTHER = 'other',
}

@Entity('family_relations')
export class FamilyRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column()
  fromUserId: string;

  @Column()
  toUserId: string;

  @Column({ type: 'enum', enum: RelationType })
  relationType: RelationType;

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: Family;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @CreateDateColumn()
  createdAt: Date;
}
