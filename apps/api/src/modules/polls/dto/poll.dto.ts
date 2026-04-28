import { IsString, IsArray, IsOptional, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePollDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  options: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowMultiple?: boolean;
}

export class VotePollDto {
  @ApiProperty()
  @IsNumber()
  optionIndex: number;
}
