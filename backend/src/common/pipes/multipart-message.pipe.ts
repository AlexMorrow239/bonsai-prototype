import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

import { CreateMessageDto, FileUploadDto } from '@modules/chat/dto/';

@Injectable()
export class MultipartMessagePipe implements PipeTransform {
  private readonly logger = new Logger(MultipartMessagePipe.name);

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // If the value is already transformed (not multipart), return as is
      if (!value.files && !value.messageData) {
        this.logger.debug(
          'No files or messageData found, returning value as is'
        );
        return value;
      }

      // Parse the messageData string into an object
      let messageData: Partial<CreateMessageDto>;
      try {
        messageData =
          typeof value.messageData === 'string'
            ? JSON.parse(value.messageData)
            : value.messageData;
      } catch (error) {
        this.logger.error('Failed to parse messageData:', error);
        throw new BadRequestException('Invalid messageData format');
      }

      // Transform file data if present
      const files: FileUploadDto[] = value.files
        ? Array.isArray(value.files)
          ? value.files
          : [value.files]
        : [];

      // If there are files but no content, set content to empty string
      if (files.length > 0 && !messageData.content) {
        this.logger.debug(
          'Files present without content, setting empty content'
        );
        messageData.content = '';
      }

      // Only validate content is required if there are no files
      if (!messageData.content && files.length === 0) {
        throw new BadRequestException('Message must contain content or files');
      }

      // Construct the complete CreateMessageDto
      const result = {
        content: messageData.content || '', // Ensure content is never undefined
        is_ai_response: messageData.is_ai_response ?? false,
        files: files,
      } as CreateMessageDto;

      return result;
    } catch (error) {
      this.logger.error('Error in pipe:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid multipart form data');
    }
  }
}
