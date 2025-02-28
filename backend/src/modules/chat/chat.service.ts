import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
  ChatResponseDto,
  CreateChatDto,
  UpdateChatDto,
} from '@/modules/chat/dto';
import { Project } from '@/modules/projects/schemas/project.schema';
import { ErrorHandler } from '@/utils/errorHandler.util';

import { IChat } from './schemas/chat.schema';
import { IMessage } from './schemas/message.schema';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel('Chat') private chatModel: Model<IChat>,
    @InjectModel('Message') private messageModel: Model<IMessage>,
    @InjectModel(Project.name) private projectModel: Model<Project>
  ) {}

  private toChatResponse(chat: IChat): ChatResponseDto {
    return {
      _id: chat._id,
      title: chat.title,
      preview: chat.preview,
      project_id: chat.project_id,
      is_active: chat.is_active,
      last_message_at: chat.last_message_at,
      created_at: chat.createdAt,
      updated_at: chat.updatedAt,
    };
  }

  /**
   * Create a new chat
   */
  async createChat(createChatDto: CreateChatDto): Promise<ChatResponseDto> {
    try {
      this.logger.debug('Creating new chat:', createChatDto);

      let projectId = undefined;

      // Validate project if provided
      if (createChatDto.project_id) {
        if (!Types.ObjectId.isValid(createChatDto.project_id)) {
          throw new BadRequestException('Invalid project ID format');
        }

        const projectExists = await this.projectModel.exists({
          _id: createChatDto.project_id,
          is_active: true,
        });

        if (!projectExists) {
          throw new NotFoundException(
            `Project with ID ${createChatDto.project_id} not found`
          );
        }

        projectId = new Types.ObjectId(createChatDto.project_id);
        this.logger.debug(
          `Chat will be associated with project: ${createChatDto.project_id}`
        );
      } else {
        this.logger.debug('Creating chat without project association');
      }

      // Create chat with default values
      const chatData = {
        title: createChatDto.title,
        project_id: projectId,
        preview: 'New chat created',
        is_active: true,
        last_message_at: new Date(),
      };

      const newChat = new this.chatModel(chatData);
      const savedChat = await newChat.save();

      this.logger.debug('Chat created successfully:', {
        chatId: savedChat._id,
        title: savedChat.title,
        hasProjectAssociation: !!savedChat.project_id,
      });

      return this.toChatResponse(savedChat);
    } catch (error) {
      this.logger.error('Failed to create chat:', {
        error: error.message,
        dto: createChatDto,
      });

      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'create chat',
        { createChatDto },
        [BadRequestException, NotFoundException]
      );
    }
  }

  /**
   * Get a chat by its ID
   */
  async getChatById(chatId: string): Promise<ChatResponseDto> {
    try {
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      const chat = await this.chatModel
        .findOne({
          _id: new Types.ObjectId(chatId),
          is_active: true,
        })
        .exec();

      if (!chat) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      return this.toChatResponse(chat);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'get chat by id',
        { chatId },
        [BadRequestException, NotFoundException]
      );
    }
  }

  /**
   * Get all active chats, sorted by last message time
   */
  async getChats(): Promise<ChatResponseDto[]> {
    try {
      const chats = await this.chatModel
        .find({ is_active: true })
        .sort({ last_message_at: -1 })
        .exec();

      this.logger.debug(`Retrieved ${chats.length} active chats`);
      return chats.map((chat) => this.toChatResponse(chat));
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'get all chats',
        undefined,
        []
      );
    }
  }

  /**
   * Update a chat by ID
   * @throws {BadRequestException} When chat ID format is invalid
   * @throws {NotFoundException} When chat is not found
   * @throws {InternalServerErrorException} When database operation fails
   */
  async updateChat(
    chatId: string,
    updateChatDto: UpdateChatDto
  ): Promise<ChatResponseDto> {
    try {
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      const updatedChat = await this.chatModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(chatId), is_active: true },
          {
            ...updateChatDto,
            updated_at: new Date(),
          },
          {
            new: true,
            runValidators: true,
          }
        )
        .exec();

      if (!updatedChat) {
        throw new NotFoundException(`Chat with ID ${chatId} not found`);
      }

      this.logger.debug(`Successfully updated chat ${chatId}`);
      return this.toChatResponse(updatedChat);
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'update chat',
        { chatId, updateChatDto },
        [BadRequestException, NotFoundException]
      );
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

      const chat = await this.chatModel
        .findOneAndUpdate(
          { _id: chatId, is_active: true },
          {
            is_active: false,
            updated_at: new Date(),
          },
          {
            runValidators: true,
            new: true,
          }
        )
        .exec();

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

      const messages = await this.messageModel.find({ chat_id: chatId }).exec();

      const aiResponseCount = messages.filter((m) => m.is_ai_response).length;
      const messageCount = messages.length;
      const userMessageCount = messageCount - aiResponseCount;

      this.logger.debug(
        `Retrieved stats for chat ${chatId}: ${messageCount} total messages, ${aiResponseCount} AI responses`
      );

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

  async findChatsByProject(projectId: string): Promise<ChatResponseDto[]> {
    try {
      if (!Types.ObjectId.isValid(projectId)) {
        throw new BadRequestException('Invalid project ID format');
      }

      const chats = await this.chatModel
        .find({
          project_id: new Types.ObjectId(projectId),
          is_active: true,
        })
        .sort({ last_message_at: -1 })
        .exec();

      this.logger.debug(
        `Retrieved ${chats.length} chats for project ${projectId}`
      );
      return chats.map((chat) => this.toChatResponse(chat));
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'find chats by project',
        { projectId },
        [BadRequestException]
      );
    }
  }
}
