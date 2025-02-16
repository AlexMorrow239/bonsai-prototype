export interface FileUploadStatus {
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "completed" | "error";
}

export interface UploadedFile {
  file_id: string;
  chat_id: number;
  name: string;
  size: number;
  type: string;
  url?: string;
  created_at: string;
  uploadStatus: FileUploadStatus;
}
