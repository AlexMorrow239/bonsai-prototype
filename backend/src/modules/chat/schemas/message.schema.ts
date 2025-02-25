import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';

interface FileAttachment {
  _id: string;
  name: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
}

@Schema({
  timestamps: true,
  collection: 'messages',
})
export class Message {
  @Prop({ type: Types.ObjectId, required: true })
  chat_id: Types.ObjectId;

  @Prop({
    required: function (this: Message) {
      // Content is required only if there are no files
      return !this.files?.length;
    },
    default: '',
  })
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
        path: String,
        url: { type: String, required: false },
      },
    ],
    default: [],
  })
  files?: FileAttachment[];

  createdAt: Date;
  updatedAt: Date;
}

export type IMessage = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);

// Add custom validation
MessageSchema.pre('validate', function (next) {
  if (!this.content && (!this.files || this.files.length === 0)) {
    next(new Error('Message must contain either content or files'));
  }
  next();
});
