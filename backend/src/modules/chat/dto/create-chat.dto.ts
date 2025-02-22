import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatDto {
  @ApiProperty({ description: 'The title of the chat' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'The associated project ID',
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  project_id?: string;
}
