import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGroup } from '../../entities/chat-group.entity';
import { Message } from '../../entities/message.entity';
import { CreateGroupDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatGroup) private groupRepo: Repository<ChatGroup>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  async createGroup(familyId: string, userId: string, dto: CreateGroupDto): Promise<ChatGroup> {
    const group = this.groupRepo.create({ familyId, createdById: userId, ...dto });
    return this.groupRepo.save(group);
  }

  async getGroups(familyId: string): Promise<ChatGroup[]> {
    return this.groupRepo.find({
      where: { familyId },
      order: { createdAt: 'ASC' },
    });
  }

  async getMessages(groupId: string, page = 1, limit = 50): Promise<{ data: Message[]; total: number }> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const [data, total] = await this.messageRepo.findAndCount({
      where: { groupId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.reverse(), total };
  }

  async sendMessage(groupId: string, senderId: string, dto: SendMessageDto): Promise<Message> {
    const message = this.messageRepo.create({ groupId, senderId, ...dto });
    const saved = await this.messageRepo.save(message);
    return this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    await this.messageRepo.delete({ id: messageId, senderId: userId });
  }
}
