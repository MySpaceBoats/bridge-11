import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyRelation } from '../../entities/family-relation.entity';
import { FamilyMember } from '../../entities/family-member.entity';
import { User } from '../../entities/user.entity';
import { AddRelationDto } from './dto/tree.dto';

export interface TreeNode {
  id: string;
  data: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  };
  position: { x: number; y: number };
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

@Injectable()
export class FamilyTreeService {
  constructor(
    @InjectRepository(FamilyRelation) private relationRepo: Repository<FamilyRelation>,
    @InjectRepository(FamilyMember) private memberRepo: Repository<FamilyMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getTree(familyId: string): Promise<{ nodes: TreeNode[]; edges: TreeEdge[] }> {
    const members = await this.memberRepo.find({
      where: { familyId },
      relations: ['user'],
    });

    const relations = await this.relationRepo.find({
      where: { familyId },
    });

    // Auto-layout: simple grid
    const nodes: TreeNode[] = members.map((m, i) => ({
      id: m.userId,
      data: {
        userId: m.userId,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
      },
      position: {
        x: (i % 4) * 220,
        y: Math.floor(i / 4) * 180,
      },
    }));

    const edges: TreeEdge[] = relations.map((r) => ({
      id: r.id,
      source: r.fromUserId,
      target: r.toUserId,
      label: r.relationType,
    }));

    return { nodes, edges };
  }

  async addRelation(familyId: string, dto: AddRelationDto): Promise<FamilyRelation> {
    const relation = this.relationRepo.create({ familyId, ...dto });
    return this.relationRepo.save(relation);
  }

  async removeRelation(familyId: string, relationId: string): Promise<void> {
    const relation = await this.relationRepo.findOne({
      where: { id: relationId, familyId },
    });
    if (!relation) throw new NotFoundException('Relation not found');
    await this.relationRepo.remove(relation);
  }

  async getRelations(familyId: string): Promise<FamilyRelation[]> {
    return this.relationRepo.find({
      where: { familyId },
      relations: ['fromUser', 'toUser'],
    });
  }
}
