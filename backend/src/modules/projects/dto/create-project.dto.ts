import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'The description of the project' })
  @IsString()
  @IsOptional()
  description?: string;
}
