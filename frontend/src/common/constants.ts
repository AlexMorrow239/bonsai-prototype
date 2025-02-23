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
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/markdown",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
  ] as const,

  MIME_TYPES: {
    // Types that Gemini API can process directly
    GEMINI: {
      IMAGE: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ] as const,
      TEXT: ["text/plain"] as const,
    },

    // Types that need conversion before processing
    CONVERTIBLE: {
      PDF: ["application/pdf"] as const,
      // Add other convertible types here as needed
    },
  },
} as const;

// Type helpers
type GeminiImageType =
  (typeof FILE_CONSTRAINTS.MIME_TYPES.GEMINI.IMAGE)[number];
type GeminiTextType = (typeof FILE_CONSTRAINTS.MIME_TYPES.GEMINI.TEXT)[number];
type ConvertibleType =
  (typeof FILE_CONSTRAINTS.MIME_TYPES.CONVERTIBLE.PDF)[number];

// All types that can be uploaded
export type AllowedMimeType =
  | GeminiImageType
  | GeminiTextType
  | ConvertibleType;

// Types that Gemini can process directly
export type GeminiSupportedMimeType = GeminiImageType | GeminiTextType;

// Helper constants for human-readable sizes
export const FILE_SIZES = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

export const API_ERROR_MESSAGES: Record<any, string> = {
  UNAUTHORIZED: "Your session has expired. Please refresh the page.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INVALID_INPUT: "Invalid input provided.",
  SERVICE_ERROR: "Service is temporarily unavailable.",
  NETWORK_ERROR: "Network connection error.",
};

// Helper function to get all allowed types as a flat array
export function getAllowedTypes(): readonly string[] {
  return [
    ...FILE_CONSTRAINTS.MIME_TYPES.GEMINI.IMAGE,
    ...FILE_CONSTRAINTS.MIME_TYPES.GEMINI.TEXT,
    ...FILE_CONSTRAINTS.MIME_TYPES.CONVERTIBLE.PDF,
  ] as const;
}
