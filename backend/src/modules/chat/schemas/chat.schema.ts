import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId;
  title: string;
  preview: string;
  project_id?: Types.ObjectId;
  is_active: boolean;
  last_message_at: Date;
  chat_context: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({
  timestamps: true,
  collection: 'chats',
  versionKey: false,
})
export class Chat {
  @Prop({ required: true })
  title: string;

  @Prop({ default: 'New chat created' })
  preview: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  project_id?: Types.ObjectId;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: Date.now })
  last_message_at: Date;

  @Prop({ default: '' })
  chat_context: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Add indexes for common queries
ChatSchema.index({ project_id: 1, is_active: 1 });
ChatSchema.index({ last_message_at: -1 });
