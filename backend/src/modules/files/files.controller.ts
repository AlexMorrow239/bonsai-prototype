import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Types } from 'mongoose';

import { CreateFileDto } from './dto/create-file.dto';
import { MoveFileDto } from './dto/move-file.dto';
import { QueryFileDto } from './dto/query-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';
import { MultipartFilePipe } from './pipes/multipart-file.pipe';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a new file',
    description: 'Upload a file to the system with metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        name: {
          type: 'string',
          description: 'Custom name for the file (optional)',
        },
        parentFolderId: {
          type: 'string',
          description: 'ID of the parent folder (optional)',
        },
        customMetadata: {
          type: 'object',
          additionalProperties: true,
          description: 'Additional metadata for the file (optional)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body(MultipartFilePipe) uploadFileDto: UploadFileDto
  ) {
    return this.filesService.createFile(file, uploadFileDto);
  }

  @Post('folders')
  @ApiOperation({
    summary: 'Create a new folder',
    description: 'Create a new folder in the file system',
  })
  @ApiBody({ type: CreateFileDto })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
  })
  async createFolder(@Body() createFolderDto: CreateFileDto) {
    return this.filesService.createFolder(createFolderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Query files',
    description: 'Get files based on query parameters',
  })
  @ApiQuery({
    name: 'parentFolderId',
    required: false,
    type: String,
    description: 'ID of the parent folder to list contents from',
  })
  @ApiResponse({
    status: 200,
    description: 'List of files matching the query',
  })
  async findAll(@Query() queryFileDto: QueryFileDto) {
    return this.filesService.findAll(queryFileDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get file by ID',
    description: 'Get detailed information about a specific file',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'File details retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.filesService.findById(new Types.ObjectId(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update file',
    description: 'Update file metadata or move file to different location',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to update',
  })
  @ApiBody({ type: UpdateFileDto })
  @ApiResponse({
    status: 200,
    description: 'File updated successfully',
  })
  async update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(new Types.ObjectId(id), updateFileDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete file',
    description: 'Move file to trash or permanently delete if already in trash',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.filesService.remove(new Types.ObjectId(id));
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore file from trash',
    description: 'Restore a file that was previously moved to trash',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to restore',
  })
  @ApiResponse({
    status: 200,
    description: 'File restored successfully',
  })
  async restore(@Param('id') id: string) {
    return this.filesService.restore(new Types.ObjectId(id));
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download file',
    description: 'Download the actual file content',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to download',
  })
  @ApiResponse({
    status: 200,
    description: 'File content stream',
  })
  async download(@Param('id') id: string) {
    return this.filesService.downloadFile(new Types.ObjectId(id));
  }

  @Post(':id/star')
  @ApiOperation({
    summary: 'Star/unstar file',
    description: 'Toggle the starred status of a file',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to star/unstar',
  })
  @ApiResponse({
    status: 200,
    description: 'File starred/unstarred successfully',
  })
  async toggleStar(@Param('id') id: string) {
    return this.filesService.toggleStar(new Types.ObjectId(id));
  }

  @Post(':id/move')
  @ApiOperation({
    summary: 'Move file',
    description: 'Move a file or folder to a different location',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the file to move',
  })
  @ApiBody({ type: MoveFileDto })
  @ApiResponse({
    status: 200,
    description: 'File moved successfully',
  })
  async moveFile(@Param('id') id: string, @Body() moveFileDto: MoveFileDto) {
    return this.filesService.moveFile(new Types.ObjectId(id), moveFileDto);
  }
}
