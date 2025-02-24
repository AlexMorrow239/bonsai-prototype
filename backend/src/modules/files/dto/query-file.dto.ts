import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
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
    description: 'Filter by parent folder ID (use "null" for root level items)',
    required: false,
    example: '507f1f77bcf86cd799439011',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (
      value === 'null' ||
      value === null ||
      value === 'undefined' ||
      value === undefined
    ) {
      return null;
    }
    try {
      return new Types.ObjectId(value);
    } catch (error) {
      return value; // Let validation handle invalid values
    }
  })
  parentFolderId?: Types.ObjectId | null;

  @ApiProperty({
    description: 'Filter for folders only',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isFolder?: boolean;

  @ApiProperty({
    description: 'Filter for trashed items',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isTrashed?: boolean;

  @ApiProperty({
    description: 'Filter for starred items',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
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
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value === undefined ? true : value;
  })
  isActive?: boolean = true;
}
