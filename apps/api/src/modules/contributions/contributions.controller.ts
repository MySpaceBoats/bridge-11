import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto, PledgeDto, UpdatePaymentDto } from './dto/contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('contributions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  create(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateContributionDto,
  ) {
    return this.contributionsService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@Param('familyId') familyId: string) {
    return this.contributionsService.findByFamily(familyId);
  }

  @Get(':contributionId')
  findOne(@Param('contributionId') contributionId: string) {
    return this.contributionsService.findById(contributionId);
  }

  @Get(':contributionId/summary')
  summary(@Param('contributionId') contributionId: string) {
    return this.contributionsService.getSummary(contributionId);
  }

  @Post(':contributionId/pledge')
  pledge(
    @Param('contributionId') contributionId: string,
    @CurrentUser() user: User,
    @Body() dto: PledgeDto,
  ) {
    return this.contributionsService.pledge(contributionId, user.id, dto);
  }

  @Patch('payments/:paymentId')
  updatePayment(
    @Param('paymentId') paymentId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.contributionsService.updatePayment(paymentId, user.id, dto);
  }
}
