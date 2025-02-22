import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatDto {
  @ApiPropertyOptional({ description: 'The new title of the chat' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The preview text of the chat' })
  @IsString()
  @IsOptional()
  preview?: string;
}