import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupType } from '../../../entities/chat-group.entity';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: GroupType })
  @IsEnum(GroupType)
  @IsOptional()
  type?: GroupType;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}
