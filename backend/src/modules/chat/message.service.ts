import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Document, Model, Types } from 'mongoose';

import { FileUploadDto } from '@/common/dto/file-upload.dto';
import { CreateMessageDto } from '@/modules/chat/dto/create-message.dto';
import { FileAttachmentDto } from '@/modules/chat/dto/file-attachment.dto';
import { IChat } from '@/modules/chat/schemas/chat.schema';
import { IMessage } from '@/modules/chat/schemas/message.schema';
import { AwsS3Service } from '@/services/aws-s3/aws-s3.service';
import { LlmService } from '@/services/llm-integration/llm.service';
import { ErrorHandler } from '@/utils/errorHandler.util';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel('Message') private messageModel: Model<IMessage & Document>,
    @InjectModel('Chat') private chatModel: Model<IChat>,
    private readonly awsS3Service: AwsS3Service,
    private readonly llmService: LlmService
  ) {}

  private async addSignedUrlsToMessage(
    message: IMessage & Document
  ): Promise<IMessage> {
    if (!message.files?.length) return message;

    const messageObj = message.toObject();
    messageObj.files = await Promise.all(
      messageObj.files.map(async (file) => ({
        ...file,
        url: await this.awsS3Service.getSignedUrl(file.path),
      }))
    );
    return messageObj;
  }

  async createMessage(
    chatId: string,
    createMessageDto: CreateMessageDto,
    files?: Express.Multer.File[]
  ): Promise<IMessage[]> {
    try {
      this.logger.debug('Creating message with data:', {
        chatId,
        is_ai_response: createMessageDto.is_ai_response,
        content: createMessageDto.content.substring(0, 50) + '...',
        filesCount: files?.length || 0,
      });

      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      // Verify chat exists and get current context
      const chat = await this.chatModel.findById(chatId);
      if (!chat) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      let uploadedFiles: FileAttachmentDto[] = [];

      // Process files if they exist
      if (files?.length) {
        try {
          const uploadResults = await this.awsS3Service.uploadFiles(files);
          uploadedFiles = uploadResults.map(
            ({ _id, name, mimetype, size, path, url }) => ({
              _id,
              name,
              mimetype,
              size,
              path,
              url,
            })
          );
          createMessageDto.files = uploadedFiles;
        } catch (uploadError) {
          this.logger.error('File upload failed:', uploadError);
          throw new BadRequestException('Failed to upload files');
        }
      }

      // Save user message
      const userMessage = new this.messageModel({
        chat_id: chatId,
        content: createMessageDto.content,
        is_ai_response: false,
        created_at: new Date(),
        files: createMessageDto.files || [],
      });

      const savedUserMessage = await userMessage.save();
      const userMessageWithUrls =
        await this.addSignedUrlsToMessage(savedUserMessage);

      // Get AI response from LLM service
      const llmResponse = await this.llmService.query({
        query: createMessageDto.content,
        conversationSummary: chat.chat_context || '',
      });

      // Save AI response
      const aiMessage = new this.messageModel({
        chat_id: chatId,
        content: llmResponse.llmResponse,
        is_ai_response: true,
        created_at: new Date(),
        files: [],
      });

      const savedAiMessage = await aiMessage.save();
      const aiMessageWithUrls =
        await this.addSignedUrlsToMessage(savedAiMessage);

      // Update chat metadata and context
      await this.updateChatMetadata(
        chatId,
        {
          ...createMessageDto,
          content: llmResponse.llmResponse,
        },
        llmResponse.updatedSummary
      );

      return [userMessageWithUrls, aiMessageWithUrls];
    } catch (error) {
      // If message creation fails, clean up any uploaded files
      if (createMessageDto.files?.length) {
        await this.cleanupMessageFiles(createMessageDto.files);
      }

      // If we've already saved the user message but the LLM service fails,
      // we should handle this case by returning just the user message
      if (error.message?.includes('LLM service')) {
        this.logger.warn('LLM service failed, but user message was saved', {
          chatId,
          error: error.message,
        });

        // Try to find the saved user message
        const userMessage = await this.messageModel
          .findOne({
            chat_id: chatId,
            is_ai_response: false,
          })
          .sort({ created_at: -1 });

        if (userMessage) {
          return [await this.addSignedUrlsToMessage(userMessage)];
        }
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

  private async cleanupMessageFiles(files: FileAttachmentDto[]): Promise<void> {
    try {
      this.logger.debug('Starting cleanup of message files', {
        filesToDelete: files,
      });

      const filePaths = files.map((file) => file.path);
      await this.awsS3Service.deleteFiles(filePaths);

      this.logger.debug('Successfully cleaned up message files', {
        deletedPaths: filePaths,
      });
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

      // Add fresh signed URLs to all messages with files
      return await Promise.all(
        messages.map((msg) => this.addSignedUrlsToMessage(msg))
      );
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
    messageDto: CreateMessageDto,
    updatedContext: string
  ): Promise<void> {
    try {
      const updatedChat = await this.chatModel
        .findByIdAndUpdate(
          chatId,
          {
            last_message_at: new Date(),
            preview: messageDto.content.substring(0, 100),
            chat_context: updatedContext,
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

  async getMessagesByChat(chatId: string): Promise<IMessage[]> {
    try {
      const messages = await this.messageModel
        .find({ chat_id: chatId })
        .sort({ created_at: 1 })
        .exec();

      // Add fresh signed URLs to all messages with files
      return await Promise.all(
        messages.map((msg) => this.addSignedUrlsToMessage(msg))
      );
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'get messages by chat',
        { chatId }
      );
    }
  }
}
