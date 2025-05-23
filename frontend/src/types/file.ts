// File data matching backend requirements
export interface FileServerData {
  _id: string;
  name: string;
  size: number;
  mimetype: string;
  url: string;
  path: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  mimetype: string;
}

// Frontend file type that includes the actual File object
export interface UploadedFile {
  file_id: string;
  file: File;
  metadata: FileMetadata;
}
