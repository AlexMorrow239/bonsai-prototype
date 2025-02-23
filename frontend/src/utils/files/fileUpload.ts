import type { UploadedFile } from "@/types";

export function createFileEntry(file: File, chatId: string): UploadedFile {
  console.debug("[FileUpload:Utils] Creating file entry:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    chatId,
  });

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

  console.debug("[FileUpload:Utils] File entry created:", {
    fileId,
    tempId,
    url,
    metadata: {
      name: entry.metadata.name,
      size: entry.metadata.size,
      type: entry.metadata.mimetype,
    },
  });

  return entry;
}

export function cleanupFileUrl(url?: string) {
  if (url) {
    console.debug("[FileUpload:Utils] Cleaning up file URL:", { url });
    URL.revokeObjectURL(url);
  }
}
