export const FILE_CONSTRAINTS = {
  // Maximum number of files allowed per upload
  MAX_FILES: 10,

  // Maximum file size in bytes (10MB)
  MAX_SIZE: 10 * 1024 * 1024,

  // Allowed file types for Gemini API
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "text/plain",
  ] as const,

  // Maximum total upload size in bytes (50MB)
  MAX_TOTAL_SIZE: 50 * 1024 * 1024,
} as const;
