import type { UploadedFile } from "./file";

// Message types
export interface SendMessageData {
  chatId: string;
  content: string;
  is_ai_response?: boolean;
  files?: File[];
}

// Base types without database fields
export interface NewChat {
  title: string;
  preview?: string;
  project_id?: string;
}

export interface NewMessage {
  chat_id: string;
  content: string;
  is_ai_response: boolean;
  files?: UploadedFile[];
}

export interface UpdateChat {
  id: string;
  title?: string;
  preview?: string;
}

// Full types including database fields
export interface Chat extends NewChat {
  _id: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message extends NewMessage {
  _id: string;
  files?: UploadedFile[];
  created_at: string;
  updated_at: string;
}
