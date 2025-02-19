import { FILE_CONSTRAINTS } from "@/common/constants";

import { isFileTypeSupported } from "@/services/geminiService";
import { UploadedFile } from "@/types";

export async function getAllFilesFromDataTransfer(
  dataTransfer: DataTransfer
): Promise<File[]> {
  let files: File[] = [];

  // Check if we have items (for directory support)
  if (dataTransfer.items.length > 0) {
    files = await getAllFilesFromDataTransferItems(dataTransfer.items);
  }
  // Fallback to regular files
  else if (dataTransfer.files.length > 0) {
    files = Array.from(dataTransfer.files);
  }

  // Filter out system files
  return files.filter((file) => !file.name.startsWith("."));
}

async function getAllFilesFromDataTransferItems(
  items: DataTransferItemList
): Promise<File[]> {
  const files: File[] = [];

  async function traverseFileTree(entry: FileSystemEntry) {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });
      files.push(file);
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const dirReader = dirEntry.createReader();
      const entries = await readAllDirectoryEntries(dirReader);
      await Promise.all(entries.map((e) => traverseFileTree(e)));
    }
  }

  await Promise.all(
    Array.from(items).map((item) => {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        return traverseFileTree(entry);
      }
      return Promise.resolve();
    })
  );

  return files;
}

async function readAllDirectoryEntries(
  dirReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  const entries: FileSystemEntry[] = [];
  let readEntries = await readDirectoryEntries(dirReader);

  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readDirectoryEntries(dirReader);
  }

  return entries;
}

function readDirectoryEntries(
  dirReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    dirReader.readEntries(resolve, reject);
  });
}

export function validateFiles(
  newFiles: File[],
  existingFiles: UploadedFile[] = []
) {
  const totalFiles = existingFiles.length + newFiles.length;

  // Check total number of files
  if (totalFiles > FILE_CONSTRAINTS.MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${FILE_CONSTRAINTS.MAX_FILES} files allowed`,
    };
  }

  // Calculate total size including existing files
  const existingSize = existingFiles.reduce((sum, file) => sum + file.size, 0);
  const newSize = newFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSize = existingSize + newSize;

  // Check total size
  if (totalSize > FILE_CONSTRAINTS.MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `Total upload size cannot exceed ${formatFileSize(FILE_CONSTRAINTS.MAX_TOTAL_SIZE)}`,
    };
  }

  // Validate each new file
  for (const file of newFiles) {
    // Check individual file size
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File ${file.name} exceeds maximum size of ${formatFileSize(FILE_CONSTRAINTS.MAX_FILE_SIZE)}`,
      };
    }

    // Check file type
    if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported. Allowed types: ${FILE_CONSTRAINTS.ALLOWED_TYPES.join(", ")}`,
      };
    }

    // Additional Gemini-specific validation
    if (!isFileTypeSupported(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported by the AI model`,
      };
    }
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatTimeRemaining(ms: number): string {
  if (ms < 1000) return "less than a second";

  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
}
