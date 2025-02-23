// Base interface for file data matching backend requirements
export interface FileMetadata {
  _id: string;
  name: string;
  size: number;
  mimetype: string;
  url: string;
  path: string;
}

// Frontend file type that includes the actual File object
export interface UploadedFile {
  file_id: string;
  chat_id: string;
  file: File;
  metadata: FileMetadata;
  status?: "pending" | "uploading" | "complete" | "error";
  progress?: number;
}
