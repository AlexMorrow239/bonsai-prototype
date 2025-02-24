import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FileUploadInterceptor } from '@/common/interceptors/file-upload.interceptor';
import { WordProcessorInterceptor } from '@/common/interceptors/word-processor.interceptor';
import { MultipartMessagePipe } from '@/common/pipes/multipart-message.pipe';
import { DocumentProcessorModule } from '@/modules/document-processor/document-processor.module';
import {
  Project,
  ProjectSchema,
} from '@/modules/projects/schemas/project.schema';
import { AwsS3Module } from '@/services/aws-s3/aws-s3.module';
import { LlmModule } from '@/services/llm-integration/llm.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    AwsS3Module,
    LlmModule,
    DocumentProcessorModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    MessageService,
    MultipartMessagePipe,
    FileUploadInterceptor,
    WordProcessorInterceptor,
  ],
  exports: [ChatService, MessageService],
})
export class ChatModule {}
