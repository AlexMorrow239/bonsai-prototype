import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFileDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'document.pdf',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Original name of the file when uploaded',
    example: 'original-document.pdf',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 1024567,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    description: 'S3 storage key for the file',
    example: 'uploads/2024/02/23/document-123456.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  s3Key?: string;

  @ApiProperty({
    description: 'Pre-signed URL for client access',
    example: 'https://bucket.s3.region.amazonaws.com/key?signed-params',
    required: false,
  })
  @IsString()
  @IsOptional()
  s3Url?: string;

  @ApiProperty({
    description: 'ID of the parent folder (null for root folder)',
    required: false,
    example: '507f1f77bcf86cd799439011',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-9a-fA-F]{24}|null)$/, {
    message:
      'parentFolderId must be either a valid MongoDB ObjectId or null for root folder',
  })
  parentFolderId?: string | Types.ObjectId | null;

  @ApiProperty({
    description: 'Whether this is a folder',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFolder?: boolean = false;

  @ApiProperty({
    description: 'Full path of the file in the virtual file system',
    required: false,
    example: '/documents/project/document.pdf',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({
    description: 'Whether the file is starred',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isStarred?: boolean = false;

  @ApiProperty({
    description: 'Additional metadata for the file',
    required: false,
    example: { category: 'documents', tags: ['important'] },
  })
  @IsOptional()
  customMetadata?: Record<string, any>;
}
