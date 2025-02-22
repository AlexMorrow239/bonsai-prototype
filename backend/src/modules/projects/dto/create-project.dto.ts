import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the project' })
  @IsString()
  description: string;
}
