export interface FileUploadStatus {
  // Basic status
  status: "idle" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;

  // Size metrics
  totalSize?: number; // Total file size in bytes
  uploadedSize?: number; // Bytes uploaded so far

  // Speed metrics
  uploadSpeed?: number; // Bytes per second
  remainingTime?: number; // Milliseconds remaining

  // Timestamps
  startTime?: number;
  completedAt?: number;
  failedAt?: number;
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
