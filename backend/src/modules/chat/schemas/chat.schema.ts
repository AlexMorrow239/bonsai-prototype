import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export type IChat = Chat & Document;

@Schema({
  timestamps: true,
  collection: 'chats',
})
export class Chat {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String })
  preview?: string;

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project_id?: Types.ObjectId;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: Date })
  last_message_at?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Add index for project lookups
ChatSchema.index({ project_id: 1, is_active: 1 });
