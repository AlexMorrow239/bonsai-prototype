import type { UploadedFile } from "@/types";

export function createFileEntry(file: File, chatId: string): UploadedFile {
  const fileId = crypto.randomUUID();
  const tempId = crypto.randomUUID();
  const url = URL.createObjectURL(file);

  const entry: UploadedFile = {
    file_id: fileId,
    chat_id: chatId,
    file: file,
    metadata: {
      _id: tempId,
      name: file.name,
      size: file.size,
      mimetype: file.type,
      url: url,
      path: "", // Will be assigned by server
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
