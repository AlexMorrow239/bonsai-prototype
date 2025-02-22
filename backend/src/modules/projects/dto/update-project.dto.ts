import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ description: 'Whether the project is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
