import { FILE_CONSTRAINTS } from "@/common/constants";

import type { FileUploadStatus, UploadedFile } from "@/types";
import { AppError } from "@/utils/errorUtils";

interface UploadProgressCallback {
  (status: Partial<FileUploadStatus>): void;
}

export async function uploadFileWithProgress(
  file: File,
  onProgress: UploadProgressCallback
): Promise<string> {
  try {
    // Initialize upload status
    onProgress({
      progress: 0,
      status: "uploading",
      totalSize: file.size,
      uploadedSize: 0,
      startTime: Date.now(),
      uploadSpeed: 0,
    });

    // For non-PDF files, use the regular upload simulation
    const CHUNK_SIZE = FILE_CONSTRAINTS.CHUNK_SIZE;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;

    // Simulate network conditions
    const minSpeed = FILE_CONSTRAINTS.MIN_UPLOAD_SPEED;
    const maxSpeed = FILE_CONSTRAINTS.MAX_UPLOAD_SPEED;
    let currentSpeed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

    // Process each chunk
    for (let chunk = 0; chunk < totalChunks; chunk++) {
      // Simulate random network errors (1% chance)
      if (Math.random() < 0.01) {
        throw new AppError("Network connection interrupted", "NETWORK_ERROR");
      }

      const startByte = chunk * CHUNK_SIZE;
      const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
      const currentChunkSize = endByte - startByte;

      // Simulate upload delay
      const delay = (currentChunkSize / currentSpeed) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Simulate speed variations
      currentSpeed = Math.max(
        minSpeed,
        Math.min(maxSpeed, currentSpeed * (0.8 + Math.random() * 0.4))
      );

      uploadedChunks++;
      const uploadedSize = Math.min(uploadedChunks * CHUNK_SIZE, file.size);
      const currentTime = Date.now();

      // Calculate metrics
      const progress = Math.round((uploadedSize / file.size) * 100);
      const elapsedTime = (currentTime - Date.now()) / 1000; // in seconds
      const uploadSpeed = uploadedSize / elapsedTime;
      const remainingSize = file.size - uploadedSize;
      const remainingTime = (remainingSize / uploadSpeed) * 1000;

      // Report progress
      onProgress({
        progress,
        uploadedSize,
        uploadSpeed,
        remainingTime,
      });
    }

    // Add small delay before marking as completed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mark as completed
    onProgress({
      progress: 100,
      status: "completed",
      uploadedSize: file.size,
      completedAt: Date.now(),
    });

    return URL.createObjectURL(file);
  } catch (error) {
    // Report error status
    onProgress({
      progress: 0,
      status: "error",
      error: error instanceof Error ? error.message : "Upload failed",
      failedAt: Date.now(),
    });

    throw error;
  }
}

export function createFileEntry(file: File, chatId: string): UploadedFile {
  return {
    file_id: crypto.randomUUID(),
    chat_id: chatId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    created_at: new Date().toISOString(),
    uploadStatus: {
      progress: 100,
      status: "completed",
    },
  };
}

export function cleanupFileUrl(url?: string) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
