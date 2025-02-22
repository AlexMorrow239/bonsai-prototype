import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
  ],
  controllers: [ChatController],
  providers: [ChatService, MessageService, AwsS3Service],
})
export class ChatModule {}
