import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AwsS3Service } from '@/services/aws-s3.service';

import { File, FileSchema } from './file.schema';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MultipartFilePipe } from './pipes/multipart-file.pipe';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FilesController],
  providers: [FilesService, AwsS3Service, MultipartFilePipe],
  exports: [FilesService],
})
export class FilesModule {}
