// Base interface for file data
interface BaseFile {
  file_id: `${string}-${string}-${string}-${string}-${string}`; // UUID format
  chat_id: number;
  name: string;
  size: number;
  type: string;
  created_at: string;
}

// Progress information
export interface FileUploadProgress {
  totalSize: number;
  uploadedSize: number;
  uploadSpeed: number;
  remainingTime: number;
  startTime: number;
  completedAt?: number;
  failedAt?: number;
}

// Base upload status without progress
export type BaseUploadStatus =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "completed" }
  | { status: "error"; error: string };

// Full upload status with progress
export type UploadStatus =
  | ({ status: "idle" } & { progress?: never })
  | { status: "uploading"; progress: number }
  | { status: "completed"; progress: 100 }
  | { status: "error"; error: string; progress: 0 };

// Combined type for status updates
export type FileUploadStatus = UploadStatus & Partial<FileUploadProgress>;

// Type for partial status updates
export type PartialFileUploadStatus = Partial<FileUploadStatus>;

// File states
export interface UploadingFile extends BaseFile {
  url?: undefined;
  uploadStatus: Extract<
    UploadStatus,
    { status: "idle" | "uploading" | "error" }
  >;
}

export interface CompletedFile extends BaseFile {
  url: string;
  uploadStatus: Extract<UploadStatus, { status: "completed" }>;
}

export type UploadedFile = UploadingFile | CompletedFile;
