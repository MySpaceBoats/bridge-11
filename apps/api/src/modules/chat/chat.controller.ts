import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateGroupDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('groups')
  createGroup(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateGroupDto,
  ) {
    return this.chatService.createGroup(familyId, user.id, dto);
  }

  @Get('groups')
  getGroups(@Param('familyId') familyId: string) {
    return this.chatService.getGroups(familyId);
  }

  @Get('groups/:groupId/messages')
  getMessages(
    @Param('groupId') groupId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(groupId, +page, +limit);
  }

  @Post('groups/:groupId/messages')
  sendMessage(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(groupId, user.id, dto);
  }

  @Delete('groups/:groupId/messages/:messageId')
  deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
  ) {
    return this.chatService.deleteMessage(messageId, user.id);
  }
}
