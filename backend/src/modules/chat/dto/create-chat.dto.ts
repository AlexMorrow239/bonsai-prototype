import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Title of the chat',
    example: 'My new chat',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'ID of the associated project (optional)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  project_id?: string;
}
