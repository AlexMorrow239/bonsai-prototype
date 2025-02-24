import { Chat, Message } from "@/types/chat";
import { Project } from "@/types/project";

// Base API response wrapper from NestJS Transform Interceptor
export interface ApiResponse<T> {
  data: T;
  metadata?: {
    path: string;
  };
  timestamp?: string;
}

// Chat types
export type ChatListResponse = Chat[];
export type ChatResponse = Chat;

// Message types
export type MessageListResponse = Message[];
export type MessageResponse = Message;

// Project types
export type ProjectListResponse = Project[];
export type ProjectResponse = Project;
