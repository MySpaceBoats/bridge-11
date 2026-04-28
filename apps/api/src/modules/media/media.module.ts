import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { Album } from '../../entities/album.entity';
import { Media } from '../../entities/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Album, Media])],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
