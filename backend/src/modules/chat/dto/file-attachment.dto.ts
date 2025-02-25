import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FileAttachmentDto {
  @ApiProperty({ description: 'The unique identifier of the file' })
  @IsString()
  _id: string;

  @ApiProperty({ description: 'The name of the file' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The MIME type of the file' })
  @IsString()
  mimetype: string;

  @ApiProperty({ description: 'The size of the file in bytes' })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'The S3 file path/key' })
  @IsString()
  path: string;

  @ApiProperty({
    description: 'The temporary signed URL for file access',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;
}
