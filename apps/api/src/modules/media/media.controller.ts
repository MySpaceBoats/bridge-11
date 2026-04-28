import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('albums')
  createAlbum(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @Body('name') name: string,
    @Body('eventId') eventId?: string,
  ) {
    return this.mediaService.createAlbum(familyId, user.id, name, eventId);
  }

  @Get('albums')
  getAlbums(@Param('familyId') familyId: string) {
    return this.mediaService.getAlbums(familyId);
  }

  @Get('albums/:albumId')
  getAlbum(@Param('albumId') albumId: string) {
    return this.mediaService.getAlbum(albumId);
  }

  @Get()
  getMedia(
    @Param('familyId') familyId: string,
    @Query('albumId') albumId?: string,
  ) {
    return this.mediaService.getMedia(familyId, albumId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (_req, file, cb) =>
          cb(null, `${uuidv4()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    }),
  )
  uploadMedia(
    @Param('familyId') familyId: string,
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body('albumId') albumId?: string,
  ) {
    return this.mediaService.uploadMedia(familyId, user.id, file, albumId);
  }

  @Delete(':mediaId')
  deleteMedia(
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: User,
  ) {
    return this.mediaService.deleteMedia(mediaId, user.id);
  }
}
