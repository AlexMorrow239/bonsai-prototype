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
export interface ChatListResponse {
  data: Chat[];
  metadata?: {
    path: string;
  };
  timestamp?: string;
}

export interface ChatResponse {
  data: Chat;
  metadata?: {
    path: string;
  };
  timestamp?: string;
}

// Message types
export interface MessageListResponse {
  data: Message[];
  metadata?: {
    path: string;
  };
  timestamp?: string;
}

export interface MessageResponse {
  data: Message;
  metadata?: {
    path: string;
  };
  timestamp?: string;
}

// Project types
export interface ProjectListResponse {
  data: Project[];
  metadata?: {
    path: string;
  };
  timestamp?: string;
}

export interface ProjectResponse {
  data: Project;
  metadata?: {
    path: string;
  };
  timestamp?: string;
}
