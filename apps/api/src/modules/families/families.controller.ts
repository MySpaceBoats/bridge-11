import {
  Controller, Get, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto, InviteMemberDto } from './dto/create-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateFamilyDto) {
    return this.familiesService.create(user.id, dto);
  }

  @Get()
  myFamilies(@CurrentUser() user: User) {
    return this.familiesService.findMyFamilies(user.id);
  }

  @Get(':familyId')
  findOne(@Param('familyId') familyId: string) {
    return this.familiesService.findById(familyId);
  }

  @Get(':familyId/members')
  getMembers(@Param('familyId') familyId: string) {
    return this.familiesService.getMembers(familyId);
  }

  @Post(':familyId/members')
  inviteMember(
    @CurrentUser() user: User,
    @Param('familyId') familyId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.familiesService.inviteMember(user.id, familyId, dto.userId);
  }

  @Delete(':familyId/members/:userId')
  removeMember(
    @CurrentUser() user: User,
    @Param('familyId') familyId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.familiesService.removeMember(user.id, familyId, targetUserId);
  }
}
