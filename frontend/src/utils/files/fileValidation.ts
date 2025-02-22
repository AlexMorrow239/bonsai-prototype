import type { UploadedFile } from "@/types";

import { formatFileSize } from "./fileFormat";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf", // pdf
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "text/plain", // txt
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

function validateFileSize(file: File): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: `File ${file.name} is empty` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File ${file.name} exceeds maximum size of ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { valid: true };
}

export function validateFiles(
  newFiles: File[],
  existingFiles: UploadedFile[] = []
): FileValidationResult {
  // Filter out system files
  const validFiles = newFiles.filter((file) => !file.name.startsWith("."));

  if (validFiles.length === 0) {
    return {
      valid: false,
      error: "No valid files found to upload",
    };
  }

  // Check total number of files
  const totalFiles = existingFiles.length + validFiles.length;
  if (totalFiles > MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES} files allowed`,
    };
  }

  // Validate each file
  for (const file of validFiles) {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check individual file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }
  }

  return { valid: true };
}

// Helper function to check if a file is valid without detailed error messages
export function isFileValid(file: File): boolean {
  return validateFiles([file]).valid;
}

// Helper function to get supported file extensions
export function getSupportedExtensions(): string[] {
  return ALLOWED_MIME_TYPES.map((mimeType) => {
    switch (mimeType) {
      case "application/pdf":
        return "pdf";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "docx";
      case "text/plain":
        return "txt";
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "xlsx";
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return "pptx";
      default:
        return "";
    }
  }).filter(Boolean);
}
