export interface Chat {
  chatInfo: ChatInfo;
  messages: Message[];
}

export interface ChatInfo {
  chat_id: number;
  project_id?: number;
  title: string;
  is_active: boolean;
}

export interface Message {
  message_id: number;
  content: string;
  created_at: string;
  is_ai_response: boolean;
}

export interface ChatListItem {
  chat_id: number;
  project_id?: number;
  title: string;
  last_message_at: string;
  is_active: boolean;
  preview: string;
}
