import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { FileUploadDto } from '@/common/dto/file-upload.dto';

export class CreateMessageDto {
  @ApiProperty({ description: 'The content of the message' })
  @ValidateIf((o) => !o.files || o.files.length === 0)
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
