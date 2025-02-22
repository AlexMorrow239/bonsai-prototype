// Base types without database fields
export interface NewChat {
  title: string;
  preview?: string;
  project_id?: string;
  is_active: boolean;
}

export interface NewMessage {
  chat_id: string;
  content: string;
  is_ai_response: boolean;
  files?: FileUpload[];
}

// Full types including database fields
export interface Chat extends NewChat {
  _id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message extends NewMessage {
  _id: string;
  created_at: string;
  updated_at: string;
}

export interface FileUpload {
  file_id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  file_path: string;
}
