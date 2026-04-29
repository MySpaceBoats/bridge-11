import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../entities/event.entity';
import { ParticipationStatus } from '../../../entities/event-participation.entity';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recurrenceRule?: string;
}

export class RespondEventDto {
  @ApiProperty({ enum: ParticipationStatus })
  @IsEnum(ParticipationStatus)
  status: ParticipationStatus;
}
