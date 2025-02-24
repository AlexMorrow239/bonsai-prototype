import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export type FileDocument = File & Document;

@Schema({
  timestamps: true,
})
export class File {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number; // in bytes

  @Prop({
    required: function (this: File) {
      return !this.isFolder;
    },
  })
  s3Key?: string; // S3 object key for internal operations

  @Prop({
    required: function (this: File) {
      return !this.isFolder;
    },
  })
  s3Url?: string; // Pre-signed URL for client access

  @Prop({ type: Types.ObjectId, ref: 'File', default: null })
  parentFolderId: Types.ObjectId | null; // null if in root

  @Prop({ default: false })
  isFolder: boolean;

  @Prop({ default: false })
  isTrashed: boolean;

  @Prop()
  trashedDate?: Date;

  @Prop({
    type: Map,
    of: String,
    default: new Map(),
  })
  customMetadata: Map<string, string>;

  @Prop()
  path: string; // Full path in the virtual file system

  @Prop({ default: false })
  isStarred: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const FileSchema = SchemaFactory.createForClass(File);
