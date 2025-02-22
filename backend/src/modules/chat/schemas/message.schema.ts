import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

interface FileAttachment {
  _id: string;
  name: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

@Schema({
  timestamps: true,
  collection: 'messages',
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

  @Prop({
    type: [
      {
        _id: String,
        name: String,
        mimetype: String,
        size: Number,
        url: String,
        path: String,
      },
    ],
  })
  files?: FileAttachment[];

  createdAt: Date;
  updatedAt: Date;
}

export type IMessage = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);
