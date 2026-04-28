import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from '../../entities/contribution.entity';
import { ContributionPayment } from '../../entities/contribution-payment.entity';
import { CreateContributionDto, PledgeDto, UpdatePaymentDto } from './dto/contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution) private contributionRepo: Repository<Contribution>,
    @InjectRepository(ContributionPayment) private paymentRepo: Repository<ContributionPayment>,
  ) {}

  async create(familyId: string, userId: string, dto: CreateContributionDto): Promise<Contribution> {
    const contribution = this.contributionRepo.create({
      familyId,
      createdById: userId,
      ...dto,
    });
    return this.contributionRepo.save(contribution);
  }

  async findByFamily(familyId: string): Promise<Contribution[]> {
    return this.contributionRepo.find({
      where: { familyId },
      relations: ['createdBy', 'payments', 'payments.user', 'event'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(contributionId: string): Promise<Contribution> {
    const contribution = await this.contributionRepo.findOne({
      where: { id: contributionId },
      relations: ['createdBy', 'payments', 'payments.user', 'event'],
    });
    if (!contribution) throw new NotFoundException('Contribution not found');
    return contribution;
  }

  async pledge(contributionId: string, userId: string, dto: PledgeDto): Promise<ContributionPayment> {
    let payment = await this.paymentRepo.findOne({
      where: { contributionId, userId },
    });
    if (payment) {
      Object.assign(payment, dto);
    } else {
      payment = this.paymentRepo.create({ contributionId, userId, ...dto });
    }
    return this.paymentRepo.save(payment);
  }

  async updatePayment(paymentId: string, userId: string, dto: UpdatePaymentDto): Promise<ContributionPayment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    Object.assign(payment, dto);
    return this.paymentRepo.save(payment);
  }

  async getSummary(contributionId: string) {
    const payments = await this.paymentRepo.find({ where: { contributionId } });
    const totalPromised = payments.reduce((s, p) => s + Number(p.promisedAmount), 0);
    const totalPaid = payments.reduce((s, p) => s + Number(p.paidAmount), 0);
    return { totalPromised, totalPaid, count: payments.length };
  }
}
