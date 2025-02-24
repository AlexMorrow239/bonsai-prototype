import type { FileServerData, UploadedFile } from "@/types";

export function createFileEntry(file: File): UploadedFile {
  const fileId = crypto.randomUUID();

  const entry: UploadedFile = {
    file_id: fileId,
    file: file,
    metadata: {
      name: file.name,
      size: file.size,
      mimetype: file.type,
    },
  };

  return entry;
}

// Handle file formatting operations
export function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined || isNaN(bytes)) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
