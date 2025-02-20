import { UploadedFile } from "@/types";

export interface Chat {
  chatInfo: ChatInfo;
  messages: Message[];
}

export interface ChatInfo {
  chat_id: number;
  project_id?: number | null;
  title: string;
  last_message_at?: string; // Optional since new chats won't have messages
  preview?: string; // Optional since new chats won't have messages
}

export interface Message {
  message_id: number;
  content: string;
  created_at: string;
  is_ai_response: boolean;
  files?: UploadedFile[];
}
