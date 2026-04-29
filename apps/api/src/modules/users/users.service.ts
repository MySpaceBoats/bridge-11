import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<Omit<User, 'passwordHash'>> {
    await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<Omit<User, 'passwordHash'>> {
    await this.userRepo.update(id, { avatarUrl });
    return this.findById(id);
  }

  async searchUsers(query: string): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q OR LOWER(u.email) LIKE :q', {
        q: `%${query.toLowerCase()}%`,
      })
      .limit(20)
      .getMany();
    return users.map(({ passwordHash, ...safe }: any) => safe);
  }
}
