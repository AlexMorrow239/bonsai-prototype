import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AwsS3Module } from '@/services/aws-s3/aws-s3.module';

import { File, FileSchema } from './file.schema';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MultipartFilePipe } from './pipes/multipart-file.pipe';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FilesController],
  providers: [FilesService, AwsS3Module, MultipartFilePipe],
  exports: [FilesService],
})
export class FilesModule {}
