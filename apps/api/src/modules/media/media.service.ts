import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../../entities/album.entity';
import { Media, MediaType } from '../../entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Album) private albumRepo: Repository<Album>,
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
  ) {}

  async createAlbum(familyId: string, userId: string, name: string, eventId?: string): Promise<Album> {
    const album = this.albumRepo.create({ familyId, name, createdById: userId, eventId });
    return this.albumRepo.save(album);
  }

  async getAlbums(familyId: string): Promise<Album[]> {
    return this.albumRepo.find({
      where: { familyId },
      relations: ['createdBy', 'event'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAlbum(albumId: string): Promise<Album> {
    const album = await this.albumRepo.findOne({
      where: { id: albumId },
      relations: ['media', 'createdBy', 'event'],
    });
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async uploadMedia(
    familyId: string,
    userId: string,
    file: Express.Multer.File,
    albumId?: string,
  ): Promise<Media> {
    const isVideo = file.mimetype.startsWith('video/');
    const url = `/uploads/media/${file.filename}`;
    const media = this.mediaRepo.create({
      familyId,
      uploadedById: userId,
      albumId,
      url,
      type: isVideo ? MediaType.VIDEO : MediaType.PHOTO,
      name: file.originalname,
      size: file.size,
    });
    const saved = await this.mediaRepo.save(media);

    if (albumId) {
      const album = await this.albumRepo.findOne({ where: { id: albumId } });
      if (album && !album.coverUrl) {
        await this.albumRepo.update(albumId, { coverUrl: url });
      }
    }

    return saved;
  }

  async getMedia(familyId: string, albumId?: string): Promise<Media[]> {
    const where: any = { familyId };
    if (albumId) where.albumId = albumId;
    return this.mediaRepo.find({
      where,
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    await this.mediaRepo.delete({ id: mediaId, uploadedById: userId });
  }
}
