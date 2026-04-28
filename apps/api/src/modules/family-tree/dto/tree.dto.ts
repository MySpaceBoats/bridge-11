import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationType } from '../../../entities/family-relation.entity';

export class AddRelationDto {
  @ApiProperty()
  @IsString()
  fromUserId: string;

  @ApiProperty()
  @IsString()
  toUserId: string;

  @ApiProperty({ enum: RelationType })
  @IsEnum(RelationType)
  relationType: RelationType;
}

export class UpdateRelationDto {
  @ApiPropertyOptional({ enum: RelationType })
  @IsEnum(RelationType)
  @IsOptional()
  relationType?: RelationType;
}
