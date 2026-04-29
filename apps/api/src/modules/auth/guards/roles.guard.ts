import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { FamilyMember, FamilyRole } from '../../../entities/family-member.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(FamilyMember)
    private familyMemberRepo: Repository<FamilyMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<FamilyRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const familyId = request.params.familyId || request.body.familyId;

    if (!familyId) return true;

    const membership = await this.familyMemberRepo.findOne({
      where: { userId: user.id, familyId },
    });

    return membership && requiredRoles.includes(membership.role);
  }
}
