// Base interface for file data matching backend requirements
export interface FileMetadata {
  name: string;
  mimetype: string;
  size: number;
  url?: string;
  file_path?: string;
}

// Frontend file type that includes the actual File object
export interface UploadedFile {
  file_id: string;
  chat_id: string;
  file: File;
  metadata: FileMetadata;
}
