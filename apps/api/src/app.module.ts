import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FamiliesModule } from './modules/families/families.module';
import { FamilyTreeModule } from './modules/family-tree/family-tree.module';
import { EventsModule } from './modules/events/events.module';
import { ChatModule } from './modules/chat/chat.module';
import { MediaModule } from './modules/media/media.module';
import { PollsModule } from './modules/polls/polls.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FeedModule } from './modules/feed/feed.module';

import { User } from './entities/user.entity';
import { Family } from './entities/family.entity';
import { FamilyMember } from './entities/family-member.entity';
import { FamilyRelation } from './entities/family-relation.entity';
import { Event } from './entities/event.entity';
import { EventParticipation } from './entities/event-participation.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { Message } from './entities/message.entity';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Album } from './entities/album.entity';
import { Media } from './entities/media.entity';
import { Poll } from './entities/poll.entity';
import { PollVote } from './entities/poll-vote.entity';
import { Contribution } from './entities/contribution.entity';
import { ContributionPayment } from './entities/contribution-payment.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: +config.get('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'postgres'),
        database: config.get('DATABASE_NAME', 'family_bridge'),
        entities: [
          User, Family, FamilyMember, FamilyRelation,
          Event, EventParticipation, ChatGroup, Message,
          Post, Comment, Like, Album, Media,
          Poll, PollVote, Contribution, ContributionPayment, Notification,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    FamiliesModule,
    FamilyTreeModule,
    EventsModule,
    ChatModule,
    MediaModule,
    PollsModule,
    ContributionsModule,
    NotificationsModule,
    FeedModule,
  ],
})
export class AppModule {}
