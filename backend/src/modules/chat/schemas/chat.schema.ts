import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'chats',
})
export class Chat {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String})
  preview?: string

  @Prop({ type: Types.ObjectId })
  project_id?: Types.ObjectId;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date })
  last_message_at?: Date;
}

export type IChat = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);