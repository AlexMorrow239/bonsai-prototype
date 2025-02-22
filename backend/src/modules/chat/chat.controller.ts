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

import {
  ChatResponseDto,
  CreateChatDto,
  CreateMessageDto,
  UpdateChatDto,
} from '@/common/dto/chat';
import { FileUploadInterceptor } from '@/common/interceptors/file-upload.interceptor';
import { MessageService } from '@/modules/chat/message.service';
import { AwsS3Service } from '@/services/aws-s3.service';

import { ChatService } from './chat.service';
import { IMessage } from './schemas/message.schema';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly mesageService: MessageService,
    private readonly awsS3Service: AwsS3Service
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
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The chat has been successfully created.',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new message with optional file attachments',
  })
  @ApiParam({ name: 'chatId', description: 'ID of the chat' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files to upload (max 5 files)',
        },
        content: {
          type: 'string',
          description: 'The content of the message',
        },
        is_ai_response: {
          type: 'boolean',
          description: 'Whether this is an AI response',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'), FileUploadInterceptor)
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.mesageService.createMessage(chatId, createMessageDto, files);
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
