import { CreateMessageDto } from '@/common/dto/chat';
import { IChat } from '@/modules/chat/schemas/chat.schema';
import { IMessage } from '@/modules/chat/schemas/message.schema';
import { ErrorHandler } from '@/utils/errorHandler.util';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel('Message') private messageModel: Model<IMessage>,
    @InjectModel('Chat') private chatModel: Model<IChat>,
  ) {}

  async createMessage(chatId: string, createMessageDto: CreateMessageDto): Promise<IMessage> {
    try {
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      // Verify chat exists
      const chatExists = await this.chatModel.exists({ _id: chatId });
      if (!chatExists) {
        throw new BadRequestException(`Chat with ID ${chatId} not found`);
      }

      const newMessage = new this.messageModel({
        ...createMessageDto,
        chat_id: chatId,
        created_at: new Date(),
      });

      const savedMessage = await newMessage.save();

      // Update chat metadata
      await this.updateChatMetadata(chatId, createMessageDto);

      return savedMessage;
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'create message',
        { chatId, messageData: createMessageDto },
        [BadRequestException]
      );
    }
  }

  async findMessagesByChatId(chatId: string, options: {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
  } = {}): Promise<IMessage[]> {
    try {
      if (!Types.ObjectId.isValid(chatId)) {
        throw new BadRequestException(`Invalid chat ID format: ${chatId}`);
      }

      const { limit = 50, skip = 0, sort = { created_at: -1 } } = options;

      return await this.messageModel
        .find({ chat_id: chatId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      ErrorHandler.handleServiceError(
        this.logger,
        error,
        'find messages by chat ID',
        { chatId, options },
        [BadRequestException]
      );
    }
  }

  private async updateChatMetadata(chatId: string, messageDto: CreateMessageDto): Promise<void> {
    await this.chatModel.findByIdAndUpdate(
      chatId,
      {
        last_message_at: new Date(),
        preview: messageDto.content.substring(0, 100),
        updated_at: new Date(),
      },
      { runValidators: true }
    ).exec();
  }
}