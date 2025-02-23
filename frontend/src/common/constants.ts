export const FILE_CONSTRAINTS = {
  // File count limits
  MAX_FILES: 10,

  // Individual file size limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB per file

  // Total upload size limit
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB total

  ALLOWED_TYPES: [
    "application/pdf", // pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "text/plain", // txt
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  ],
} as const;

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
