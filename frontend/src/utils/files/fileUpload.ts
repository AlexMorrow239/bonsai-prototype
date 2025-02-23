import type { UploadedFile } from "@/types";

export function createFileEntry(file: File, chatId: string): UploadedFile {
  return {
    file_id: crypto.randomUUID(),
    chat_id: chatId,
    file: file,
    metadata: {
      _id: crypto.randomUUID(), // Temporary ID until server assigns one
      name: file.name,
      size: file.size,
      mimetype: file.type,
      url: URL.createObjectURL(file),
      path: "", // Will be assigned by server
    },
  };
}

export function cleanupFileUrl(url?: string) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
