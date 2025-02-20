import { FILE_CONSTRAINTS } from "@/common/constants";

import { isFileTypeSupported } from "@/services/geminiService";
import { UploadedFile } from "@/types";

import { formatFileSize } from "./fileFormat";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

interface FileTypeValidation {
  valid: boolean;
  type?: string;
  error?: string;
}

const MIME_TYPE_MAP: Record<string, string> = {
  // Text files
  txt: "text/plain",
  md: "text/markdown",

  // Document files
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Data files
  json: "application/json",
  xml: "application/xml",
  csv: "text/csv",

  // Image files
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",

  // Code files
  js: "text/javascript",
  ts: "text/typescript",
  py: "text/x-python",
  html: "text/html",
  css: "text/css",
};

function validateFileType(file: File): FileTypeValidation {
  // If file has a valid MIME type, use it
  if (
    file.type &&
    FILE_CONSTRAINTS.ALLOWED_TYPES.some((type) => file.type.startsWith(type))
  ) {
    return { valid: true, type: file.type };
  }

  // Try to infer type from extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) {
    return { valid: false, error: "File has no extension" };
  }

  const inferredType = MIME_TYPE_MAP[extension];
  if (!inferredType) {
    return { valid: false, error: `Unsupported file extension: .${extension}` };
  }

  if (
    !FILE_CONSTRAINTS.ALLOWED_TYPES.some((type) =>
      inferredType.startsWith(type)
    )
  ) {
    return {
      valid: false,
      error: `File type ${inferredType} is not supported`,
    };
  }

  return { valid: true, type: inferredType };
}

function validateFileSize(file: File): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: `File ${file.name} is empty` };
  }

  if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File ${file.name} exceeds maximum size of ${formatFileSize(FILE_CONSTRAINTS.MAX_FILE_SIZE)}`,
    };
  }

  return { valid: true };
}

function validateTotalSize(
  newFiles: File[],
  existingFiles: UploadedFile[]
): FileValidationResult {
  const existingSize = existingFiles.reduce((sum, file) => sum + file.size, 0);
  const newSize = newFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSize = existingSize + newSize;

  if (totalSize > FILE_CONSTRAINTS.MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `Total upload size cannot exceed ${formatFileSize(FILE_CONSTRAINTS.MAX_TOTAL_SIZE)}`,
    };
  }

  return { valid: true };
}

export function validateFiles(
  newFiles: File[],
  existingFiles: UploadedFile[] = []
): FileValidationResult {
  // Filter out system files and empty arrays
  const validFiles = newFiles.filter((file) => !file.name.startsWith("."));

  if (validFiles.length === 0) {
    return {
      valid: false,
      error: "No valid files found to upload",
    };
  }

  // Check total number of files
  const totalFiles = existingFiles.length + validFiles.length;
  if (totalFiles > FILE_CONSTRAINTS.MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${FILE_CONSTRAINTS.MAX_FILES} files allowed`,
    };
  }

  // Check total size
  const totalSizeValidation = validateTotalSize(validFiles, existingFiles);
  if (!totalSizeValidation.valid) {
    return totalSizeValidation;
  }

  // Validate each file
  for (const file of validFiles) {
    // Check individual file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }

    // Check file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return {
        valid: false,
        error: typeValidation.error || `Invalid file type for ${file.name}`,
      };
    }

    // Check AI model support
    if (!isFileTypeSupported(typeValidation.type || file.type)) {
      return {
        valid: false,
        error: `File type ${file.type || typeValidation.type} is not supported by the AI model`,
      };
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
  return Object.entries(MIME_TYPE_MAP)
    .filter(
      ([_, mimeType]) =>
        FILE_CONSTRAINTS.ALLOWED_TYPES.some((type) =>
          mimeType.startsWith(type)
        ) && isFileTypeSupported(mimeType)
    )
    .map(([ext]) => ext);
}
