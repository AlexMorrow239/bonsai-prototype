import { ApiProperty } from '@nestjs/swagger';

import { Types } from 'mongoose';

export class ProjectResponseDto {
  @ApiProperty({ description: 'The unique identifier of the project' })
  _id: Types.ObjectId;

  @ApiProperty({ description: 'The name of the project' })
  name: string;

  @ApiProperty({
    description: 'The description of the project',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Whether the project is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}
