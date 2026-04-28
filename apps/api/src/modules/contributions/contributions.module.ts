import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { Contribution } from '../../entities/contribution.entity';
import { ContributionPayment } from '../../entities/contribution-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contribution, ContributionPayment])],
  providers: [ContributionsService],
  controllers: [ContributionsController],
  exports: [ContributionsService],
})
export class ContributionsModule {}
