import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class MoveFileDto {
  @ApiProperty({
    description:
      'ID of the target folder to move the file to. Use null for root directory.',
    required: true,
    type: String,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  targetFolderId: string | null;
}
