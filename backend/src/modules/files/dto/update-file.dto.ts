import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';

export class UpdateFileDto {
  @ApiProperty({
    description: 'New name for the file',
    required: false,
    example: 'renamed-document.pdf',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'New parent folder ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'parentFolderId must be a valid MongoDB ObjectId',
  })
  parentFolderId?: string;

  @ApiProperty({
    description: 'New path in the virtual file system',
    required: false,
    example: '/documents/new-folder/document.pdf',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({
    description: 'Star or unstar the file',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @ApiProperty({
    description: 'Move to or restore from trash',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTrashed?: boolean;

  @ApiProperty({
    description: 'Date when the file was moved to trash',
    required: false,
    example: '2024-02-23T23:00:00.000Z',
  })
  @IsOptional()
  trashedDate?: Date;

  @ApiProperty({
    description: 'Additional metadata for the file',
    required: false,
    example: { category: 'documents', tags: ['important'] },
  })
  @IsOptional()
  customMetadata?: Record<string, any>;
}
