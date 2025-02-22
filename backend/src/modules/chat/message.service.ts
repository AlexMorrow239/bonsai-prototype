import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { CreateMessageDto, FileUploadDto } from '@/common/dto/chat';
import { IChat } from '@/modules/chat/schemas/chat.schema';
import { IMessage } from '@/modules/chat/schemas/message.schema';
import { AwsS3Service } from '@/services/aws-s3.service';
import { ErrorHandler } from '@/utils/errorHandler.util';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel('Message') private messageModel: Model<IMessage>,
    @InjectModel('Chat') private chatModel: Model<IChat>,
    private readonly awsS3Service: AwsS3Service
  ) {}

  async createMessage(
    chatId: string,
    createMessageDto: CreateMessageDto,
    files?: Express.Multer.File[]
  ): Promise<IMessage> {
    try {
      // Add logging to see what value is being received
      this.logger.debug('Creating message with data:', {
        chatId,
        is_ai_response: createMessageDto.is_ai_response,
        content: createMessageDto.content.substring(0, 50) + '...',
      });

      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      // Verify chat exists
      const chatExists = await this.chatModel.exists({ _id: chatId });
      if (!chatExists) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      let uploadedFiles: FileUploadDto[] = [];

      // Process files if they exist
      if (files?.length) {
        try {
          this.logger.debug(`Processing ${files.length} files for upload`);
          uploadedFiles = await this.awsS3Service.uploadFiles(files);
          createMessageDto.files = uploadedFiles;
        } catch (uploadError) {
          this.logger.error('File upload failed:', uploadError);
          throw new BadRequestException('Failed to upload files');
        }
      }

      const message = new this.messageModel({
        chat_id: chatId,
        content: createMessageDto.content,
        is_ai_response: createMessageDto.is_ai_response,
        created_at: new Date(),
        files: createMessageDto.files || [],
      });

      const savedMessage = await message.save();

      // Update chat metadata
      await this.updateChatMetadata(chatId, createMessageDto);

      return savedMessage;
    } catch (error) {
      // If message creation fails, clean up any uploaded files
      if (createMessageDto.files?.length) {
        await this.cleanupMessageFiles(createMessageDto.files);
      }

      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'create message',
        { chatId, messageData: createMessageDto },
        [BadRequestException, NotFoundException]
      );
    }
  }

  private async cleanupMessageFiles(files: FileUploadDto[]): Promise<void> {
    try {
      const filePaths = files.map((file) => file.file_path);
      await this.awsS3Service.deleteFiles(filePaths);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'cleanup message files',
        { files },
        [BadRequestException]
      );
    }
  }

  async findMessagesByChatId(
    chatId: string,
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    } = {}
  ): Promise<IMessage[]> {
    try {
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      // Verify chat exists
      const chatExists = await this.chatModel.exists({ _id: chatId });
      if (!chatExists) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      const { limit = 50, skip = 0, sort = { created_at: -1 } } = options;

      const messages = await this.messageModel
        .find({ chat_id: chatId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      if (!messages.length) {
        throw new NotFoundException(`No messages found for chat ID ${chatId}`);
      }

      return messages;
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'find messages by chat ID',
        { chatId, options },
        [BadRequestException, NotFoundException]
      );
    }
  }

  private async updateChatMetadata(
    chatId: string,
    messageDto: CreateMessageDto
  ): Promise<void> {
    try {
      const updatedChat = await this.chatModel
        .findByIdAndUpdate(
          chatId,
          {
            last_message_at: new Date(),
            preview: messageDto.content.substring(0, 100),
            updated_at: new Date(),
          },
          { runValidators: true, new: true }
        )
        .exec();

      if (!updatedChat) {
        throw new NotFoundException(
          `Failed to update metadata for chat ID ${chatId}`
        );
      }
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'update chat metadata',
        { chatId, messageDto },
        [BadRequestException, NotFoundException]
      );
    }
  }
}
