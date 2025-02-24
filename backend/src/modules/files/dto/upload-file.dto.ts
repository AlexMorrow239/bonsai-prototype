import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'Custom name for the file',
    required: false,
    example: 'my-document.pdf',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'ID of the parent folder',
    required: false,
    example: '507f1f77bcf86cd799439011',
    nullable: true,
  })
  @IsOptional()
  parentFolderId?: string | null;

  @ApiProperty({
    description: 'Additional metadata for the file',
    required: false,
    example: { category: 'documents', tags: ['important'] },
    type: Object,
  })
  @IsOptional()
  customMetadata?: Record<string, any>;
}
