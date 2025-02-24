import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { AwsS3Service } from '@/services/aws-s3.service';
import { ErrorHandler } from '@/utils/errorHandler.util';

import { CreateFileDto } from './dto/create-file.dto';
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

  async create(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
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

      // Create file metadata in MongoDB
      const createFileDto: CreateFileDto = {
        name: uploadFileDto.name || file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Key: uploadResult.path,
        s3Url: uploadResult.url,
        parentFolderId,
        customMetadata: transformedMetadata,
        path: parentFolderId
          ? `${await this.getParentPath(parentFolderId.toString())}/${uploadFileDto.name || file.originalname}`
          : uploadFileDto.name || file.originalname,
      };

      const newFile = await this.fileModel.create(createFileDto);
      return newFile;
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

      const folderData = {
        name: createFolderDto.name,
        originalName: createFolderDto.name,
        isFolder: true,
        mimeType: 'folder',
        size: 0,
        path: parentFolderId
          ? `${await this.getParentPath(parentFolderId.toString())}/${createFolderDto.name}`
          : createFolderDto.name,
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

  async findOne(id: Types.ObjectId) {
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

  async download(id: Types.ObjectId) {
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

  private async getParentPath(parentId: string): Promise<string> {
    const parent = await this.fileModel.findById(parentId).exec();
    if (!parent) {
      throw new Error('Parent folder not found');
    }
    return parent.path;
  }

  private buildQuery(queryFileDto: QueryFileDto): Record<string, any> {
    const query: Record<string, any> = {};

    if (queryFileDto.parentFolderId) {
      query.parentFolderId = queryFileDto.parentFolderId;
    }
    if (queryFileDto.isFolder !== undefined) {
      query.isFolder = queryFileDto.isFolder;
    }
    if (queryFileDto.isTrashed !== undefined) {
      query.isTrashed = queryFileDto.isTrashed;
    }
    if (queryFileDto.isStarred !== undefined) {
      query.isStarred = queryFileDto.isStarred;
    }
    if (queryFileDto.mimeType) {
      query.mimeType = queryFileDto.mimeType;
    }
    if (queryFileDto.name) {
      query.name = { $regex: queryFileDto.name, $options: 'i' };
    }
    if (queryFileDto.path) {
      query.path = { $regex: `^${queryFileDto.path}` };
    }
    if (queryFileDto.isActive !== undefined) {
      query.isActive = queryFileDto.isActive;
    }

    return query;
  }
}
