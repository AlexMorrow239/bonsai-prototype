export interface FileSystemEntity {
  _id: string;
  name: string;
  path: string;
  isFolder: boolean;
  parentFolderId: string | null;
  isStarred: boolean;
  isTrashed: boolean;
  isActive: boolean;
  size?: number;
  mimeType?: string;
  url?: string;
  customMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderData {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  parentFolderId?: string | null;
  customMetadata?: Record<string, any>;
}

export interface UploadFileData {
  file: File;
  name?: string;
  parentFolderId?: string | null;
  customMetadata?: Record<string, any>;
}

export interface UpdateFileData {
  _id: string;
  name?: string;
  parentFolderId?: string | null;
  isStarred?: boolean;
  isTrashed?: boolean;
  isActive?: boolean;
  customMetadata?: Record<string, any>;
}

export type FileListResponse = FileSystemEntity[];
export type FileResponse = FileSystemEntity;

export interface QueryFileParams {
  parentFolderId?: string | null;
}
