import { ApiResponse } from "./api";

export interface FileSystemEntity {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key?: string;
  s3Url?: string;
  parentFolderId: string | null;
  isFolder: boolean;
  isTrashed: boolean;
  trashedDate?: Date;
  customMetadata?: Record<string, string>;
  path: string;
  isStarred: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileListResponseData {
  data: FileSystemEntity[];
}

export interface FileResponseData {
  data: FileSystemEntity;
}

export type FileListResponse = ApiResponse<FileListResponseData>;
export type FileResponse = ApiResponse<FileResponseData>;

export interface QueryFileParams {
  parentFolderId?: string;
}

export interface UploadFileData {
  file: File;
  name?: string;
  parentFolderId?: string;
  customMetadata?: Record<string, string>;
}

export interface CreateFolderData {
  name: string;
  parentFolderId?: string;
  customMetadata?: Record<string, string>;
}

export interface UpdateFileData {
  _id: string;
  name?: string;
  parentFolderId?: string;
  customMetadata?: Record<string, string>;
}
