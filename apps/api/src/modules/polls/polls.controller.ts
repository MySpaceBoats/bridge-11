import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PollsService } from './polls.service';
import { CreatePollDto, VotePollDto } from './dto/poll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('polls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  create(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreatePollDto,
  ) {
    return this.pollsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@Param('familyId') familyId: string) {
    return this.pollsService.findByFamily(familyId);
  }

  @Get(':pollId')
  findOne(@Param('pollId') pollId: string) {
    return this.pollsService.findById(pollId);
  }

  @Post(':pollId/vote')
  vote(
    @Param('pollId') pollId: string,
    @CurrentUser() user: User,
    @Body() dto: VotePollDto,
  ) {
    return this.pollsService.vote(pollId, user.id, dto);
  }

  @Delete(':pollId')
  delete(@Param('pollId') pollId: string) {
    return this.pollsService.delete(pollId);
  }
}
