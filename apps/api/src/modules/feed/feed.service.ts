import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/comment.entity';
import { Like } from '../../entities/like.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
  ) {}

  async createPost(familyId: string, authorId: string, content: string, imageUrl?: string): Promise<Post> {
    const post = this.postRepo.create({ familyId, authorId, content, imageUrl });
    const saved = await this.postRepo.save(post);
    return this.postRepo.findOne({ where: { id: saved.id }, relations: ['author', 'comments', 'likes'] });
  }

  async getFeed(familyId: string, page = 1, limit = 20): Promise<{ data: Post[]; total: number }> {
    const [data, total] = await this.postRepo.findAndCount({
      where: { familyId },
      relations: ['author', 'comments', 'comments.author', 'likes'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async addComment(postId: string, authorId: string, content: string): Promise<Comment> {
    const comment = this.commentRepo.create({ postId, authorId, content });
    const saved = await this.commentRepo.save(comment);
    return this.commentRepo.findOne({ where: { id: saved.id }, relations: ['author'] });
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const existing = await this.likeRepo.findOne({ where: { postId, userId } });
    if (existing) {
      await this.likeRepo.remove(existing);
      return { liked: false };
    }
    await this.likeRepo.save(this.likeRepo.create({ postId, userId }));
    return { liked: true };
  }

  async deletePost(postId: string, authorId: string): Promise<void> {
    await this.postRepo.delete({ id: postId, authorId });
  }
}
