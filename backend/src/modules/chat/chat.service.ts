import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IChat } from './schemas/chat.schema';
import { IMessage } from './schemas/message.schema';
import { CreateChatDto } from '@/common/dto/chat';
import { UpdateChatDto } from'@/common/dto/chat';
import { CreateMessageDto } from '@/common/dto/chat';
import { ErrorHandler } from '@/utils/errorHandler.util';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel('Chat') private chatModel: Model<IChat>,
    @InjectModel('Message') private messageModel: Model<IMessage>,
  ) {}

  /**
   * Create a new chat
   */
  async createChat(createChatDto: CreateChatDto): Promise<IChat> {
    try {
      const newChat = new this.chatModel({
        ...createChatDto,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return await newChat.save();
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'create chat',
        { createChatDto },
        [BadRequestException]
      );
    }
  }

  /**
   * Get a chat by its ID
   */
  async getChatById(chatId: string): Promise<IChat> {
    try {
      // Validate chatId format first
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      const chat = await this.chatModel.findOne({
        _id: chatId,
        is_active: true
      }).exec();

      if (!chat) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      return chat;
    } catch (error) {
      // Handle Mongoose/MongoDB specific errors
      if (error.name === 'MongoServerError') {
        this.logger.error(`MongoDB error when fetching chat ${chatId}`, {
          error: error.message,
          code: error.code
        });
        throw new InternalServerErrorException('Database error occurred');
      }

      // Handle Mongoose casting errors
      if (error.name === 'CastError') {
        this.logger.error(`Invalid ID format for chat ${chatId}`, {
          error: error.message
        });
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      // Re-throw application errors (NotFoundException, BadRequestException etc)
      if (error.status) {
        throw error;
      }

      // Log and re-throw unexpected errors
      this.logger.error(`Unexpected error fetching chat ${chatId}`, {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }


  /**
   * Get all active chats, sorted by last message time
   */
  async getChats(): Promise<IChat[]> {
    try {
      const query = { is_active: true };

      const chats = await this.chatModel
        .find(query)
        .sort({ last_message_at: -1 })
        .exec();

      // Optionally log the number of chats retrieved
      this.logger.debug(`Retrieved ${chats.length} active chats`);

      return chats;
    } catch (error) {
      // Handle Mongoose/MongoDB specific errors
      if (error.name === 'MongoServerError') {
        this.logger.error('MongoDB error when fetching chats', {
          error: error.message,
          code: error.code
        });
        throw new InternalServerErrorException('Database error occurred');
      }

      // Log and re-throw unexpected errors
      this.logger.error('Unexpected error fetching chats', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Update a chat by ID
   * @throws {BadRequestException} When chat ID format is invalid
   * @throws {NotFoundException} When chat is not found
   * @throws {InternalServerErrorException} When database operation fails
   */
  async updateChat(chatId: string, updateChatDto: UpdateChatDto): Promise<IChat> {
    try {
      // Validate chatId format first
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      const chat = await this.chatModel.findOneAndUpdate(
        { _id: chatId, is_active: true },
        {
          ...updateChatDto,
          updated_at: new Date()
        },
        {
          new: true,
          runValidators: true // Ensure mongoose validates the update
        }
      ).exec();

      if (!chat) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      this.logger.debug(`Successfully updated chat ${chatId}`);
      return chat;
    } catch (error) {
      // Handle Mongoose/MongoDB specific errors
      if (error.name === 'MongoServerError') {
        this.logger.error(`MongoDB error when updating chat ${chatId}`, {
          error: error.message,
          code: error.code,
          updateData: updateChatDto
        });
        throw new InternalServerErrorException('Database error occurred');
      }

      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        this.logger.error(`Validation error when updating chat ${chatId}`, {
          error: error.message,
          updateData: updateChatDto
        });
        throw new BadRequestException('Invalid update data provided');
      }

      // Re-throw application errors (NotFoundException, BadRequestException etc)
      if (error.status) {
        throw error;
      }

      // Log and re-throw unexpected errors
      this.logger.error(`Unexpected error updating chat ${chatId}`, {
        error: error.message,
        stack: error.stack,
        updateData: updateChatDto
      });
      throw error;
    }
  }

  /**
   * Soft delete a chat by setting is_active to false
   * @throws {BadRequestException} When chat ID format is invalid
   * @throws {NotFoundException} When chat is not found
   * @throws {InternalServerErrorException} When database operation fails
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      // Validate chatId format first
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      const chat = await this.chatModel.findOneAndUpdate(
        { _id: chatId, is_active: true },
        {
          is_active: false,
          updated_at: new Date(),
        },
        {
          runValidators: true,
          new: true
        }
      ).exec();

      if (!chat) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      this.logger.debug(`Successfully soft deleted chat ${chatId}`);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'delete chat',
        { chatId },
        [BadRequestException, NotFoundException]
      );
    }
  }

  /**
   * Get chat statistics
   * @throws {BadRequestException} When chat ID format is invalid
   * @throws {NotFoundException} When chat is not found
   * @throws {InternalServerErrorException} When database operation fails
   */
  async getChatStats(chatId: string): Promise<{
    messageCount: number;
    aiResponseCount: number;
    userMessageCount: number;
  }> {
    try {
      // Validate chatId format first
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      // Verify chat exists
      await this.getChatById(chatId);

      const messages = await this.messageModel
        .find({ chat_id: chatId })
        .exec();

      const aiResponseCount = messages.filter(m => m.is_ai_response).length;
      const messageCount = messages.length;
      const userMessageCount = messageCount - aiResponseCount;

      this.logger.debug(`Retrieved stats for chat ${chatId}: ${messageCount} total messages, ${aiResponseCount} AI responses`);

      return {
        messageCount,
        aiResponseCount,
        userMessageCount,
      };
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'get chat statistics',
        { chatId },
        [BadRequestException, NotFoundException]
      );
    }
  }
}