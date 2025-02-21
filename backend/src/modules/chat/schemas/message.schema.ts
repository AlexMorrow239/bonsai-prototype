import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

interface FileAttachment {
  file_id: string;
  filename: string;
  url: string;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
export class Message {
  @Prop({ type: Types.ObjectId, required: true })
  chat_id: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true })
  is_ai_response: boolean;

  @Prop({ type: [{ file_id: String, filename: String, url: String }] })
  files?: FileAttachment[];
}

export type IMessage = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);