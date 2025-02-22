import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from './dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Creates a new project with the provided data',
  })
  @ApiCreatedResponse({
    description: 'The project has been successfully created',
    type: ProjectResponseDto,
  })
  async createProject(
    @Body() createProjectDto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Retrieves a list of all active projects',
  })
  @ApiOkResponse({
    description: 'List of projects retrieved successfully',
    type: [ProjectResponseDto],
  })
  async findAllProjects(): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAllProjects();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by ID',
    description: 'Retrieves a specific project by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the project to retrieve',
    type: String,
  })
  @ApiOkResponse({
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Project not found or invalid project ID',
  })
  async findProjectById(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findProjectById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project',
    description: 'Updates a project with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the project to update',
    type: String,
  })
  @ApiOkResponse({
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Project not found or invalid project ID',
  })
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project',
    description: 'Soft deletes a project by setting is_active to false',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the project to delete',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'Project deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Project not found or invalid project ID',
  })
  async removeProject(@Param('id') id: string): Promise<void> {
    await this.projectsService.removeProject(id);
  }
}
