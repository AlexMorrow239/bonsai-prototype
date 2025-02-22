import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { ErrorHandler } from '@/utils/errorHandler.util';

import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from './dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>
  ) {}

  private toProjectResponse(project: ProjectDocument): ProjectResponseDto {
    return {
      _id: project._id as Types.ObjectId,
      name: project.name,
      description: project.description,
      is_active: project.is_active,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };
  }

  async createProject(
    createProjectDto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    try {
      const createdProject = new this.projectModel({
        ...createProjectDto,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const project = await createdProject.save();
      return this.toProjectResponse(project);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'create project',
        { createProjectDto },
        [BadRequestException]
      );
    }
  }

  async findAllProjects(): Promise<ProjectResponseDto[]> {
    try {
      const projects = await this.projectModel
        .find({ is_active: true })
        .sort({ created_at: -1 })
        .exec();

      this.logger.debug(`Retrieved ${projects.length} active projects`);
      return projects.map((project) => this.toProjectResponse(project));
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'find all projects',
        undefined,
        []
      );
    }
  }

  async findProjectById(id: string): Promise<ProjectResponseDto> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid project ID format: ${id}`);
      }

      const project = await this.projectModel
        .findOne({
          _id: new Types.ObjectId(id),
          is_active: true,
        })
        .exec();

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return this.toProjectResponse(project);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'find project by id',
        { projectId: id },
        [BadRequestException, NotFoundException]
      );
    }
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid project ID format: ${id}`);
      }

      const updatedProject = await this.projectModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), is_active: true },
          {
            ...updateProjectDto,
            updated_at: new Date(),
          },
          {
            new: true,
            runValidators: true,
          }
        )
        .exec();

      if (!updatedProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      this.logger.debug(`Successfully updated project ${id}`);
      return this.toProjectResponse(updatedProject);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'update project',
        { projectId: id, updateProjectDto },
        [BadRequestException, NotFoundException]
      );
    }
  }

  async removeProject(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid project ID format: ${id}`);
      }

      const result = await this.projectModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), is_active: true },
          {
            is_active: false,
            updated_at: new Date(),
          },
          { runValidators: true }
        )
        .exec();

      if (!result) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      this.logger.debug(`Successfully soft deleted project ${id}`);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'remove project',
        { projectId: id },
        [BadRequestException, NotFoundException]
      );
    }
  }
}
