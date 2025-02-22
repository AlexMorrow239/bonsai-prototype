import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Types } from 'mongoose';

export class ChatResponseDto {
  @ApiProperty({ description: 'The unique identifier of the chat' })
  _id: Types.ObjectId;

  @ApiProperty({ description: 'The title of the chat' })
  title: string;

  @ApiPropertyOptional({ description: 'Preview of the last message' })
  preview?: string;

  @ApiPropertyOptional({
    description: 'The associated project ID',
    type: String,
  })
  project_id?: Types.ObjectId;

  @ApiProperty({ description: 'Whether the chat is active' })
  is_active: boolean;

  @ApiPropertyOptional({ description: 'Timestamp of the last message' })
  last_message_at?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}
