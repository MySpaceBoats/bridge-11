import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { Family } from '../../entities/family.entity';
import { FamilyMember } from '../../entities/family-member.entity';
import { ChatGroup } from '../../entities/chat-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Family, FamilyMember, ChatGroup])],
  providers: [FamiliesService],
  controllers: [FamiliesController],
  exports: [FamiliesService],
})
export class FamiliesModule {}
