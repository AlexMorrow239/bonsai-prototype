import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { IChat } from './schemas/chat.schema';
import { IMessage } from './schemas/message.schema';
import { CreateChatDto, CreateMessageDto, UpdateChatDto } from '@/common/dto/chat';
import { MessageService } from '@/modules/chat/message.service';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService, private readonly mesageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The chat has been successfully created.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.'
  })
  async createChat(@Body() createChatDto: CreateChatDto): Promise<IChat> {
    return this.chatService.createChat(createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all chats'
  })
  async getChats(): Promise<IChat[]> {
    return this.chatService.getChats();
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to retrieve'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the chat with the specified ID.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.'
  })
  async getChatById(@Param('chatId') chatId: string): Promise<IChat> {
    return this.chatService.getChatById(chatId);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get all messages in a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to get messages from'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all messages in the specified chat.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.'
  })
  async getChatMessages(
    @Param('chatId') chatId: string
  ): Promise<IMessage[]> {
    return this.mesageService.findMessagesByChatId(chatId);
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Add a message to a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to add the message to'
  })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The message has been successfully added.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message data.'
  })
  async addMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto
  ): Promise<IMessage> {
    return this.mesageService.createMessage(chatId, createMessageDto);
  }

  @Put(':chatId')
  @ApiOperation({ summary: 'Update a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to update'
  })
  @ApiBody({ type: UpdateChatDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The chat has been successfully updated.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data.'
  })
  async updateChat(
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto
  ): Promise<IChat> {
    return this.chatService.updateChat(chatId, updateChatDto);
  }

  @Delete(':chatId')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to delete'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The chat has been successfully deleted.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.'
  })
  async deleteChat(
    @Param('chatId') chatId: string
  ): Promise<void> {
    return this.chatService.deleteChat(chatId);
  }

  @Get(':chatId/stats')
  @ApiOperation({ summary: 'Get chat statistics' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to get statistics for'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns statistics for the specified chat.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.'
  })
  async getChatStats(
    @Param('chatId') chatId: string
  ): Promise<{
    messageCount: number;
    aiResponseCount: number;
    userMessageCount: number;
  }> {
    return this.chatService.getChatStats(chatId);
  }
}