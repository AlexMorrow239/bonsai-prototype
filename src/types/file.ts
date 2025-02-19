// Base interface for file data
interface BaseFile {
  file_id: `${string}-${string}-${string}-${string}-${string}`; // UUID format
  chat_id: number;
  name: string;
  size: number;
  type: string;
  created_at: string;
}

// Status types
export type UploadStatus =
  | { status: "idle"; progress: 0 }
  | { status: "uploading"; progress: number }
  | { status: "completed"; progress: 100 }
  | { status: "error"; progress: 0; error: string };

// Detailed upload status for tracking
export interface FileUploadStatus {
  status: "idle" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  totalSize?: number;
  uploadedSize?: number;
  uploadSpeed?: number;
  remainingTime?: number;
  startTime?: number;
  completedAt?: number;
  failedAt?: number;
}

// File in uploading/error state
export interface UploadingFile extends BaseFile {
  url?: undefined;
  uploadStatus: Exclude<UploadStatus, { status: "completed" }>;
}

// File in completed state
export interface CompletedFile extends BaseFile {
  url: string;
  uploadStatus: Extract<UploadStatus, { status: "completed" }>;
}

// Combined type for all file states
export type UploadedFile = UploadingFile | CompletedFile;
