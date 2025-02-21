import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSchema } from './schemas/chat.schema';
import { MessageSchema } from './schemas/message.schema';
import { MessageService } from '@/modules/chat/message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema },
      { name: 'Message', schema: MessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, MessageService],
})
export class ChatModule {}