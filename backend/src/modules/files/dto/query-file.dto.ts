import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class QueryFileDto {
  @ApiProperty({
    description: 'Filter by file name (supports partial match)',
    required: false,
    example: 'document',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Filter by parent folder ID',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  parentFolderId?: Types.ObjectId;

  @ApiProperty({
    description: 'Filter for folders only',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isFolder?: boolean;

  @ApiProperty({
    description: 'Filter for trashed items',
    required: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTrashed?: boolean;

  @ApiProperty({
    description: 'Filter for starred items',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isStarred?: boolean;

  @ApiProperty({
    description: 'Filter by MIME type',
    required: false,
    example: 'application/pdf',
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: 'Filter by file path (supports prefix match)',
    required: false,
    example: '/documents/project',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({
    description: 'Filter for active/inactive items',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
