import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

import { Types } from 'mongoose';

@Injectable()
export class MultipartFilePipe implements PipeTransform {
  private readonly logger = new Logger(MultipartFilePipe.name);

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // If no value is present in the request
      if (!value) {
        return {};
      }

      // Extract file metadata from the form data
      const fileData = {
        name: this.transformString(value.name),
        parentFolderId: this.transformParentFolderId(value.parentFolderId),
        customMetadata: this.parseCustomMetadata(value.customMetadata),
      };

      this.logger.debug('Transformed file data:', fileData);
      return fileData;
    } catch (error) {
      this.logger.error('Error in MultipartFilePipe:', error);
      throw new BadRequestException(
        error.message || 'Invalid file upload data'
      );
    }
  }

  private transformString(value: any): string | undefined {
    if (!value || value === 'undefined' || value === 'null') {
      return undefined;
    }
    return String(value);
  }

  private transformParentFolderId(value: any): string | null {
    if (!value || value === 'undefined' || value === 'null' || value === '') {
      return null;
    }

    // Don't transform to ObjectId here, just validate it's a potential valid format
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      return null;
    }

    return value;
  }

  private parseCustomMetadata(value: any): Record<string, any> {
    if (!value) {
      return {};
    }

    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      return {};
    }
  }
}
