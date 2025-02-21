import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateChatDto {
  @ApiProperty({ description: 'The title of the chat' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'The associated project ID' })
  @IsOptional()
  project_id?: Types.ObjectId;
}