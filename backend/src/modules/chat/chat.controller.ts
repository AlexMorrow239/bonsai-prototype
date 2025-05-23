import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileUploadInterceptor } from '@/common/interceptors/file-upload.interceptor';
import { WordProcessorInterceptor } from '@/common/interceptors/word-processor.interceptor';
import { MultipartMessagePipe } from '@/common/pipes/multipart-message.pipe';
import {
  ChatResponseDto,
  CreateChatDto,
  CreateMessageDto,
  UpdateChatDto,
} from '@/modules/chat/dto/';
import { MessageService } from '@/modules/chat/message.service';

import { ChatService } from './chat.service';
import { IMessage } from './schemas/message.schema';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly mesageService: MessageService,
    private readonly multipartMessagePipe: MultipartMessagePipe
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all chats' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'Optional project ID to filter chats',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all chats, optionally filtered by project',
    type: [ChatResponseDto],
  })
  async getChats(
    @Query('projectId') projectId?: string
  ): Promise<ChatResponseDto[]> {
    if (projectId) {
      return this.chatService.findChatsByProject(projectId);
    }
    return this.chatService.getChats();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new chat',
    description:
      'Creates a new chat that can either be associated with a project (by providing project_id) or standalone (without project association).',
  })
  @ApiBody({
    type: CreateChatDto,
    description:
      'Chat creation data. If project_id is provided, the chat will be associated with that project. If project_id is omitted, a standalone chat will be created.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The chat has been successfully created.',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or invalid project ID format.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found when project_id is provided.',
  })
  async createChat(
    @Body() createChatDto: CreateChatDto
  ): Promise<ChatResponseDto> {
    return this.chatService.createChat(createChatDto);
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to retrieve',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the chat with the specified ID.',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.',
  })
  async getChatById(@Param('chatId') chatId: string): Promise<ChatResponseDto> {
    return this.chatService.getChatById(chatId);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get all messages in a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to get messages from',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all messages in the specified chat.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.',
  })
  async getChatMessages(@Param('chatId') chatId: string): Promise<IMessage[]> {
    return this.mesageService.findMessagesByChatId(chatId);
  }

  @Post(':chatId/messages')
  @UseInterceptors(
    FilesInterceptor('files'),
    FileUploadInterceptor,
    WordProcessorInterceptor
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Create a new message with optional file attachments and get AI response',
  })
  @ApiParam({ name: 'chatId', description: 'ID of the chat' })
  @ApiBody({
    description: 'Message data and optional files',
    required: true,
    schema: {
      type: 'object',
      required: ['messageData'],
      properties: {
        messageData: {
          type: 'string',
          description: 'JSON string containing message data',
          example: JSON.stringify({
            content: 'Hello, this is a test message',
            files: [],
          }),
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files to upload (max 5 files, 10MB each)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns both the user message and AI response',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          chat_id: { type: 'string' },
          content: { type: 'string' },
          is_ai_response: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                originalname: { type: 'string' },
                path: { type: 'string' },
                mimetype: { type: 'string' },
                size: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() rawBody: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const messageData = await this.multipartMessagePipe.transform(
      { messageData: rawBody.messageData, files },
      { type: 'body', metatype: CreateMessageDto }
    );
    return this.mesageService.createMessage(chatId, messageData, files);
  }

  @Put(':chatId')
  @ApiOperation({ summary: 'Update a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to update',
  })
  @ApiBody({ type: UpdateChatDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The chat has been successfully updated.',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data.',
  })
  async updateChat(
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto
  ): Promise<ChatResponseDto> {
    return this.chatService.updateChat(chatId, updateChatDto);
  }

  @Delete(':chatId')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to delete',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The chat has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.',
  })
  async deleteChat(@Param('chatId') chatId: string): Promise<void> {
    return this.chatService.deleteChat(chatId);
  }

  @Get(':chatId/stats')
  @ApiOperation({ summary: 'Get chat statistics' })
  @ApiParam({
    name: 'chatId',
    required: true,
    description: 'The ID of the chat to get statistics for',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns statistics for the specified chat.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found.',
  })
  async getChatStats(@Param('chatId') chatId: string): Promise<{
    messageCount: number;
    aiResponseCount: number;
    userMessageCount: number;
  }> {
    return this.chatService.getChatStats(chatId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all chats for a project' })
  @ApiParam({
    name: 'projectId',
    required: true,
    description: 'The ID of the project to get chats for',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all chats for the specified project',
    type: [ChatResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid project ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async getChatsByProject(
    @Param('projectId') projectId: string
  ): Promise<ChatResponseDto[]> {
    return this.chatService.findChatsByProject(projectId);
  }
}
