import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { MultipartMessagePipe } from '@/common/pipes/multipart-message.pipe';
import { MessageService } from '@/modules/chat/message.service';
import {
  Project,
  ProjectSchema,
} from '@/modules/projects/schemas/project.schema';
import { AwsS3Service } from '@/services/aws-s3.service';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSchema } from './schemas/chat.schema';
import { MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema },
      { name: 'Message', schema: MessageSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5, // Maximum 5 files per request
      },
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, MessageService, AwsS3Service, MultipartMessagePipe],
})
export class ChatModule {}
