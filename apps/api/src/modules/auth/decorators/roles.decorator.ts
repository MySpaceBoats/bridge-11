import { SetMetadata } from '@nestjs/common';
import { FamilyRole } from '../../../entities/family-member.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: FamilyRole[]) => SetMetadata(ROLES_KEY, roles);
