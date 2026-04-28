import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../../entities/family.entity';
import { FamilyMember, FamilyRole } from '../../entities/family-member.entity';
import { ChatGroup, GroupType } from '../../entities/chat-group.entity';
import { CreateFamilyDto } from './dto/create-family.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(Family) private familyRepo: Repository<Family>,
    @InjectRepository(FamilyMember) private memberRepo: Repository<FamilyMember>,
    @InjectRepository(ChatGroup) private chatGroupRepo: Repository<ChatGroup>,
  ) {}

  async create(userId: string, dto: CreateFamilyDto): Promise<Family> {
    const family = this.familyRepo.create({ ...dto, createdById: userId });
    await this.familyRepo.save(family);

    // Creator becomes admin
    const membership = this.memberRepo.create({
      userId,
      familyId: family.id,
      role: FamilyRole.ADMIN,
    });
    await this.memberRepo.save(membership);

    // Create default general chat group
    const generalGroup = this.chatGroupRepo.create({
      familyId: family.id,
      name: 'General',
      type: GroupType.GENERAL,
      createdById: userId,
    });
    await this.chatGroupRepo.save(generalGroup);

    return family;
  }

  async findMyFamilies(userId: string): Promise<Family[]> {
    const memberships = await this.memberRepo.find({
      where: { userId },
      relations: ['family'],
    });
    return memberships.map((m) => m.family);
  }

  async findById(familyId: string): Promise<Family> {
    const family = await this.familyRepo.findOne({
      where: { id: familyId },
      relations: ['members', 'members.user'],
    });
    if (!family) throw new NotFoundException('Family not found');
    return family;
  }

  async inviteMember(adminId: string, familyId: string, invitedUserId: string): Promise<FamilyMember> {
    await this.assertAdmin(adminId, familyId);
    const existing = await this.memberRepo.findOne({
      where: { userId: invitedUserId, familyId },
    });
    if (existing) throw new ConflictException('User already a member');

    const member = this.memberRepo.create({
      userId: invitedUserId,
      familyId,
      role: FamilyRole.MEMBER,
    });
    return this.memberRepo.save(member);
  }

  async removeMember(adminId: string, familyId: string, targetUserId: string): Promise<void> {
    await this.assertAdmin(adminId, familyId);
    await this.memberRepo.delete({ userId: targetUserId, familyId });
  }

  async getMembers(familyId: string): Promise<FamilyMember[]> {
    return this.memberRepo.find({
      where: { familyId },
      relations: ['user'],
    });
  }

  private async assertAdmin(userId: string, familyId: string): Promise<void> {
    const membership = await this.memberRepo.findOne({ where: { userId, familyId } });
    if (!membership || membership.role !== FamilyRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async assertMember(userId: string, familyId: string): Promise<FamilyMember> {
    const membership = await this.memberRepo.findOne({ where: { userId, familyId } });
    if (!membership) throw new ForbiddenException('Not a member of this family');
    return membership;
  }
}
