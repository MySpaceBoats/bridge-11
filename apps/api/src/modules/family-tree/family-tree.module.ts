import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyTreeService } from './family-tree.service';
import { FamilyTreeController } from './family-tree.controller';
import { FamilyRelation } from '../../entities/family-relation.entity';
import { FamilyMember } from '../../entities/family-member.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyRelation, FamilyMember, User])],
  providers: [FamilyTreeService],
  controllers: [FamilyTreeController],
})
export class FamilyTreeModule {}
