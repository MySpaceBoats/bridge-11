import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  createPost(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @Body('content') content: string,
    @Body('imageUrl') imageUrl?: string,
  ) {
    return this.feedService.createPost(familyId, user.id, content, imageUrl);
  }

  @Get()
  getFeed(
    @Param('familyId') familyId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.feedService.getFeed(familyId, +page, +limit);
  }

  @Post(':postId/comments')
  addComment(
    @Param('postId') postId: string,
    @CurrentUser() user: User,
    @Body('content') content: string,
  ) {
    return this.feedService.addComment(postId, user.id, content);
  }

  @Post(':postId/like')
  toggleLike(@Param('postId') postId: string, @CurrentUser() user: User) {
    return this.feedService.toggleLike(postId, user.id);
  }

  @Delete(':postId')
  deletePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    return this.feedService.deletePost(postId, user.id);
  }
}
