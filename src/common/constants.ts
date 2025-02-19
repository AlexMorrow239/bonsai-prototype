import { ApiErrorCode } from "@/types";

export const FILE_CONSTRAINTS = {
  // Upload chunk configuration
  CHUNK_SIZE: 256 * 1024, // 256KB chunks for upload

  // Simulated upload speed limits (bytes/second)
  MIN_UPLOAD_SPEED: 500 * 1024, // 500KB/s minimum
  MAX_UPLOAD_SPEED: 2 * 1024 * 1024, // 2MB/s maximum

  // File count limits
  MAX_FILES: 10,

  // Individual file size limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB per file

  // Total upload size limit
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB total

  // Allowed file types for Gemini API
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "text/plain",
  ] as const,
} as const;

// Type for allowed MIME types
export type AllowedMimeType = (typeof FILE_CONSTRAINTS.ALLOWED_TYPES)[number];

// Helper constants for human-readable sizes
export const FILE_SIZES = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: "Your session has expired. Please refresh the page.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INVALID_INPUT: "Invalid input provided.",
  SERVICE_ERROR: "Service is temporarily unavailable.",
  NETWORK_ERROR: "Network connection error.",
};
