import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'The content of the message' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Whether this is an AI response' })
  @IsBoolean()
  is_ai_response: boolean;

  @ApiPropertyOptional({
    description: 'Array of files attached to the message',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        file_id: { type: 'string' },
        filename: { type: 'string' },
        url: { type: 'string' }
      }
    }
  })
  @IsArray()
  @IsOptional()
  files?: Array<{
    file_id: string;
    filename: string;
    url: string;
  }>;
}