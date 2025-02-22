import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ description: 'The unique identifier of the file' })
  @IsString()
  _id: string;

  @ApiProperty({ description: 'The original name of the file' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The MIME type of the file',
    enum: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  })
  @IsString()
  mimetype: string;

  @ApiProperty({
    description: 'The size of the file in bytes',
    maximum: 10485760,
  }) // 10MB
  @IsNumber()
  @Max(10 * 1024 * 1024)
  size: number;

  @ApiProperty({ description: 'The temporary signed URL for file access' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'The S3 file path/key' })
  @IsString()
  path: string;
}

export class CreateMessageDto {
  @ApiProperty({ description: 'The content of the message' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Whether this is an AI response' })
  @IsBoolean()
  is_ai_response: boolean;

  @ApiPropertyOptional({
    description: 'Array of files attached to the message',
    type: [FileUploadDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUploadDto)
  @IsOptional()
  files?: FileUploadDto[];
}
