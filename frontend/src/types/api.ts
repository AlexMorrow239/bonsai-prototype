export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Chat types matching the backend
export interface Chat {
  _id: string;
  title: string;
  preview?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  _id: string;
  chat_id: string;
  content: string;
  is_ai_response: boolean;
  files?: FileUpload[];
  created_at: string;
}

export interface FileUpload {
  file_id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  file_path: string;
}