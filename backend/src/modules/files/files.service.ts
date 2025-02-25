import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { AwsS3Service } from '@/services/aws-s3/aws-s3.service';
import { ErrorHandler } from '@/utils/errorHandler.util';

import { CreateFileDto } from './dto/create-file.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { QueryFileDto } from './dto/query-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { File } from './file.schema';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    private readonly s3Service: AwsS3Service
  ) {}

  private transformCustomMetadata(
    metadata: Record<string, any> | undefined
  ): Record<string, string> | undefined {
    if (!metadata) {
      return undefined;
    }

    return Object.entries(metadata).reduce(
      (acc, [key, value]) => {
        acc[key] = Array.isArray(value)
          ? JSON.stringify(value)
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
        return acc;
      },
      {} as Record<string, string>
    );
  }

  private normalizePath(path: string): string {
    // Remove multiple consecutive slashes and ensure no trailing slash
    return path.replace(/\/+/g, '/').replace(/\/$/, '');
  }

  private buildQuery(queryFileDto: QueryFileDto): Record<string, any> {
    const query: Record<string, any> = {};

    // Handle parentFolderId - values are already transformed in DTO
    if (queryFileDto.parentFolderId === undefined) {
      query.parentFolderId = null;
    } else {
      query.parentFolderId = queryFileDto.parentFolderId;
    }

    // Handle boolean filters - values are already transformed in DTO
    if (queryFileDto.isFolder !== undefined) {
      query.isFolder = queryFileDto.isFolder;
    }
    if (queryFileDto.isTrashed !== undefined) {
      query.isTrashed = queryFileDto.isTrashed;
    }
    if (queryFileDto.isStarred !== undefined) {
      query.isStarred = queryFileDto.isStarred;
    }
    if (queryFileDto.isActive !== undefined) {
      query.isActive = queryFileDto.isActive;
    } else {
      // Default to active items if not specified
      query.isActive = true;
    }

    // Handle string-based filters with proper regex escaping
    if (queryFileDto.mimeType) {
      query.mimeType = queryFileDto.mimeType;
    }
    if (queryFileDto.name) {
      // Escape special regex characters in the name
      const escapedName = queryFileDto.name.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      query.name = { $regex: escapedName, $options: 'i' };
    }
    if (queryFileDto.path) {
      // Normalize and escape the path
      const normalizedPath = this.normalizePath(queryFileDto.path);
      const escapedPath = normalizedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match exact path or path with trailing slash or path as a prefix followed by slash
      query.path = { $regex: `^${escapedPath}(?:/.*)?$`, $options: 'i' };
    }

    return query;
  }

  async createFile(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
    try {
      // Upload file to S3
      const [uploadResult] = await this.s3Service.uploadFiles([file]);

      // Transform customMetadata values to strings
      const transformedMetadata = this.transformCustomMetadata(
        uploadFileDto.customMetadata
      );

      // Convert parentFolderId to Types.ObjectId if it's not null or "null" string
      const parentFolderId =
        uploadFileDto.parentFolderId && uploadFileDto.parentFolderId !== 'null'
          ? new Types.ObjectId(uploadFileDto.parentFolderId)
          : null;

      // Get the normalized path
      const fileName = uploadFileDto.name || file.originalname;
      const path = parentFolderId
        ? this.normalizePath(
            `${await this.getParentPath(parentFolderId.toString())}/${fileName}`
          )
        : fileName;

      // Create file metadata in MongoDB
      const createFileDto: CreateFileDto = {
        name: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Key: uploadResult.path,
        s3Url: uploadResult.url,
        parentFolderId,
        customMetadata: transformedMetadata,
        path,
      };

      const newFile = await this.fileModel.create(createFileDto);
      return { ...newFile.toObject(), url: uploadResult.url };
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'create file', {
        fileName: file.originalname,
      });
    }
  }

  async createFolder(createFolderDto: CreateFileDto) {
    try {
      if (!createFolderDto.name) {
        throw new Error('Folder name is required');
      }

      // Convert parentFolderId to Types.ObjectId if it's not null or "null" string
      const parentFolderId =
        createFolderDto.parentFolderId &&
        createFolderDto.parentFolderId !== 'null'
          ? new Types.ObjectId(createFolderDto.parentFolderId)
          : null;

      // Get the normalized path
      const path = parentFolderId
        ? this.normalizePath(
            `${await this.getParentPath(parentFolderId.toString())}/${createFolderDto.name}`
          )
        : createFolderDto.name;

      const folderData = {
        name: createFolderDto.name,
        originalName: createFolderDto.name,
        isFolder: true,
        mimeType: 'folder',
        size: 0,
        path,
        parentFolderId,
        customMetadata: this.transformCustomMetadata(
          createFolderDto.customMetadata
        ),
      };

      const newFolder = await this.fileModel.create(folderData);
      return newFolder;
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'create folder', {
        folderName: createFolderDto.name,
      });
    }
  }

  async findAll(queryFileDto: QueryFileDto) {
    try {
      const query = this.buildQuery(queryFileDto);
      const files = await this.fileModel.find(query).exec();

      // Generate signed URLs for non-folder items
      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          if (!file.isFolder && file.s3Key) {
            const url = await this.s3Service.getSignedUrl(file.s3Key);
            return { ...file.toObject(), url };
          }
          return file.toObject();
        })
      );

      return filesWithUrls;
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'find files',
        queryFileDto
      );
    }
  }

  async findById(id: Types.ObjectId) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new NotFoundException(`File with ID ${id} not found`);
      }

      if (!file.isFolder && file.s3Key) {
        const url = await this.s3Service.getSignedUrl(file.s3Key);
        return { ...file.toObject(), url };
      }

      return file.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'find file', {
        fileId: id,
      });
    }
  }

  async update(id: Types.ObjectId, updateFileDto: UpdateFileDto) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new Error('File not found');
      }

      // Transform customMetadata values to strings if present
      if (updateFileDto.customMetadata) {
        updateFileDto.customMetadata = this.transformCustomMetadata(
          updateFileDto.customMetadata
        );
      }

      // Convert parentFolderId to Types.ObjectId if it's not null or "null" string
      if (updateFileDto.parentFolderId !== undefined) {
        const parentFolderId =
          updateFileDto.parentFolderId &&
          updateFileDto.parentFolderId !== 'null'
            ? new Types.ObjectId(updateFileDto.parentFolderId)
            : null;

        updateFileDto.parentFolderId = parentFolderId;
        updateFileDto.path = parentFolderId
          ? `${await this.getParentPath(parentFolderId.toString())}/${file.name}`
          : file.name;
      }

      const updatedFile = await this.fileModel
        .findByIdAndUpdate(id, updateFileDto, { new: true })
        .exec();

      return updatedFile;
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'update file', {
        fileId: id,
        updateData: updateFileDto,
      });
    }
  }

  async remove(id: Types.ObjectId) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new Error('File not found');
      }

      if (file.isTrashed) {
        // Permanently delete
        if (!file.isFolder && file.s3Key) {
          await this.s3Service.deleteFile(file.s3Key);
        }
        await this.fileModel.findByIdAndDelete(id).exec();
        return { message: 'File permanently deleted' };
      } else {
        // Move to trash
        await this.fileModel
          .findByIdAndUpdate(id, {
            isTrashed: true,
            trashedDate: new Date(),
          })
          .exec();
        return { message: 'File moved to trash' };
      }
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'remove file', {
        fileId: id,
      });
    }
  }

  async restore(id: Types.ObjectId) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new Error('File not found');
      }

      if (!file.isTrashed) {
        throw new Error('File is not in trash');
      }

      const restoredFile = await this.fileModel
        .findByIdAndUpdate(
          id,
          { isTrashed: false, trashedDate: null },
          { new: true }
        )
        .exec();

      return restoredFile;
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'restore file', {
        fileId: id,
      });
    }
  }

  async downloadFile(id: Types.ObjectId) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new Error('File not found');
      }

      if (file.isFolder) {
        throw new BadRequestException(
          'Cannot download a folder - please select a file instead'
        );
      }

      const url = await this.s3Service.getSignedUrl(file.s3Key);
      return { url };
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'download file', {
        fileId: id,
      });
    }
  }

  async toggleStar(id: Types.ObjectId) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new Error('File not found');
      }

      const updatedFile = await this.fileModel
        .findByIdAndUpdate(id, { isStarred: !file.isStarred }, { new: true })
        .exec();

      return updatedFile;
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'toggle star', {
        fileId: id,
      });
    }
  }

  async moveFile(id: Types.ObjectId, moveFileDto: MoveFileDto) {
    try {
      const file = await this.fileModel.findById(id).exec();
      if (!file) {
        throw new NotFoundException(`File with ID ${id} not found`);
      }

      // If target folder is specified, verify it exists and is a folder
      if (moveFileDto.targetFolderId) {
        const targetFolder = await this.fileModel
          .findById(moveFileDto.targetFolderId)
          .exec();
        if (!targetFolder) {
          throw new NotFoundException(
            `Target folder with ID ${moveFileDto.targetFolderId} not found`
          );
        }
        if (!targetFolder.isFolder) {
          throw new BadRequestException(
            `Target with ID ${moveFileDto.targetFolderId} is not a folder`
          );
        }
        // Prevent moving a folder into itself or its descendants
        if (file.isFolder) {
          const targetPath = await this.getParentPath(
            moveFileDto.targetFolderId
          );
          if (targetPath.startsWith(file.path)) {
            throw new BadRequestException(
              'Cannot move a folder into itself or its descendants'
            );
          }
        }
      }

      // Get the new path
      const newPath = moveFileDto.targetFolderId
        ? this.normalizePath(
            `${await this.getParentPath(moveFileDto.targetFolderId)}/${file.name}`
          )
        : file.name;

      // If moving a folder, update paths of all descendants
      if (file.isFolder) {
        const descendants = await this.fileModel
          .find({
            path: { $regex: `^${file.path}/` },
          })
          .exec();

        // Update paths of all descendants
        await Promise.all(
          descendants.map((descendant) => {
            const relativePath = descendant.path.slice(file.path.length);
            const newDescendantPath = this.normalizePath(
              `${newPath}${relativePath}`
            );
            return this.fileModel
              .findByIdAndUpdate(
                descendant._id,
                { path: newDescendantPath },
                { new: true }
              )
              .exec();
          })
        );
      }

      // Update the file's parent and path
      const updatedFile = await this.fileModel
        .findByIdAndUpdate(
          id,
          {
            parentFolderId: moveFileDto.targetFolderId
              ? new Types.ObjectId(moveFileDto.targetFolderId)
              : null,
            path: newPath,
          },
          { new: true }
        )
        .exec();

      if (!updatedFile) {
        throw new NotFoundException(`File with ID ${id} not found`);
      }

      // If it's a file (not a folder) and has an S3 key, include the signed URL
      if (!updatedFile.isFolder && updatedFile.s3Key) {
        const url = await this.s3Service.getSignedUrl(updatedFile.s3Key);
        return { ...updatedFile.toObject(), url };
      }

      return updatedFile.toObject();
    } catch (error) {
      ErrorHandler.handleServiceError(this.logger, error, 'move file', {
        fileId: id,
        targetFolderId: moveFileDto.targetFolderId,
      });
    }
  }

  private async getParentPath(parentId: string): Promise<string> {
    const parent = await this.fileModel.findById(parentId).exec();
    if (!parent) {
      throw new Error('Parent folder not found');
    }
    return parent.path;
  }
}
