import type { UploadedFile } from "@/types";

export function createFileEntry(file: File, chatId: string): UploadedFile {
  return {
    file_id: crypto.randomUUID(),
    chat_id: chatId,
    file: file,
    metadata: {
      name: file.name,
      size: file.size,
      mimetype: file.type,
      url: URL.createObjectURL(file),
    },
  };
}

export function cleanupFileUrl(url?: string) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
