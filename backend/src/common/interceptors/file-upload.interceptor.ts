import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf', // pdf
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'text/plain', // txt
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Maximum number of files
  private readonly MAX_FILES = 5;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.files) {
      // Check number of files
      if (request.files.length > this.MAX_FILES) {
        throw new BadRequestException(
          `Maximum number of files (${this.MAX_FILES}) exceeded`
        );
      }

      // Validate each file
      for (const file of request.files) {
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          throw new BadRequestException(
            `File type ${file.mimetype} is not allowed`
          );
        }

        if (file.size > this.MAX_FILE_SIZE) {
          throw new BadRequestException(
            `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
          );
        }
      }
    }

    return next.handle();
  }
}
