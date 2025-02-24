import { extname } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { FileUploadDto } from '@/common/dto/file-upload.dto';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY'
        ),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
  }
  async uploadFiles(files: Express.Multer.File[]): Promise<FileUploadDto[]> {
    try {
      this.logger.debug(`Attempting to upload ${files.length} files to S3`, {
        fileDetails: files.map((f) => ({
          originalName: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
        })),
      });

      return await Promise.all(
        files.map(async (file) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const key = `uploads/${uniqueSuffix}${extname(file.originalname)}`;

          this.logger.debug(`Processing file for S3 upload:`, {
            key,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          });

          const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          });

          try {
            await this.s3Client.send(command);
            const fileUrl = await this.getSignedUrl(key);

            const fileDto = {
              _id: key,
              name: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: fileUrl,
              path: key,
            };

            this.logger.debug(`Successfully uploaded file to S3:`, { fileDto });
            return fileDto;
          } catch (uploadError) {
            this.logger.error(
              `Failed to upload individual file ${key}: ${uploadError.message}`,
              uploadError.stack
            );
            throw uploadError;
          }
        })
      );
    } catch (error) {
      this.logger.error(
        `Failed to upload files to S3: ${error.message}`,
        error.stack,
        { bucket: this.bucketName }
      );
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`);
      throw error;
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.deleteFile(key)));
    } catch (error) {
      this.logger.error(`Failed to delete files from S3: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw error;
    }
  }
}
