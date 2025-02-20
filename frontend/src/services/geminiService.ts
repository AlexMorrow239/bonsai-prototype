import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

import { FILE_CONSTRAINTS, GeminiSupportedMimeType } from "@/common/constants";

import { type UploadedFile } from "@/types";
import { AppError } from "@/utils/errorUtils";
import { logError } from "@/utils/errorUtils";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new AppError(
    "Gemini API key is not configured",
    "SERVICE_ERROR",
    "error",
    { service: "Gemini" }
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

const SUPPORTED_MIME_TYPES = FILE_CONSTRAINTS.MIME_TYPES.GEMINI;

type SupportedImageType = (typeof SUPPORTED_MIME_TYPES.IMAGE)[number];
type SupportedTextType = (typeof SUPPORTED_MIME_TYPES.TEXT)[number];
type SupportedMimeType = GeminiSupportedMimeType;

interface FileProcessingError extends Error {
  fileName: string;
  fileType: string;
}

// Helper function to convert file to base64
async function fileToGenerativePart(file: File): Promise<Part> {
  try {
    const mimeType = file.type;

    // Handle images
    if (
      isGeminiSupported(mimeType) &&
      SUPPORTED_MIME_TYPES.IMAGE.includes(mimeType as SupportedImageType)
    ) {
      const data = await file.arrayBuffer();
      const bytes = new Uint8Array(data);

      // Convert to base64 in chunks to avoid call stack issues
      const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
      let binary = "";
      const len = bytes.byteLength;

      for (let i = 0; i < len; i += CHUNK_SIZE) {
        const chunk = bytes.slice(i, i + CHUNK_SIZE);
        chunk.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
      }

      const base64 = btoa(binary);

      return {
        inlineData: {
          data: base64,
          mimeType,
        },
      };
    }

    // Handle text files (including converted PDFs)
    if (
      isGeminiSupported(mimeType) &&
      SUPPORTED_MIME_TYPES.TEXT.includes(mimeType as SupportedTextType)
    ) {
      const text = await file.text();
      return { text };
    }

    const error = new Error(
      `Unsupported file type: ${mimeType}`
    ) as FileProcessingError;
    error.fileName = file.name;
    error.fileType = mimeType;
    throw error;
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        `Failed to process file ${file.name}: ${error.message}`,
        "SERVICE_ERROR",
        "error",
        {
          fileName: file.name,
          fileType: file.type,
          originalError: error.message,
        }
      );
    }
    throw error;
  }
}

// Helper function to check if a mime type is supported by Gemini directly
export function isGeminiSupported(
  mimeType: string
): mimeType is GeminiSupportedMimeType {
  return [...SUPPORTED_MIME_TYPES.IMAGE, ...SUPPORTED_MIME_TYPES.TEXT].includes(
    mimeType as GeminiSupportedMimeType
  );
}

// Helper function to check if a file type is supported (either directly or through conversion)
export function isFileTypeSupported(
  mimeType: string
): mimeType is SupportedMimeType {
  return [
    ...SUPPORTED_MIME_TYPES.IMAGE,
    ...SUPPORTED_MIME_TYPES.TEXT,
    ...FILE_CONSTRAINTS.MIME_TYPES.CONVERTIBLE.PDF,
  ].includes(mimeType as SupportedMimeType);
}

export async function generateGeminiResponse(
  prompt: string,
  files?: UploadedFile[]
): Promise<string> {
  try {
    // Validate input
    if (!prompt.trim() && !files) {
      throw new AppError("Prompt cannot be empty", "INVALID_INPUT");
    }

    // For text-only messages, use gemini-pro
    if (!files || files.length === 0) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        throw new AppError(
          "Failed to generate text response",
          "SERVICE_ERROR",
          "error",
          {
            originalError:
              error instanceof Error ? error.message : "Unknown error",
          }
        );
      }
    }

    // For messages with files, use gemini-pro-vision
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const parts: Part[] = [{ text: prompt }];

    // Process each file with error tracking
    const fileErrors: FileProcessingError[] = [];

    for (const uploadedFile of files) {
      try {
        if (!uploadedFile.url) {
          throw new AppError(
            `File ${uploadedFile.name} has no URL`,
            "SERVICE_ERROR"
          );
        }

        // Validate file type
        if (!isFileTypeSupported(uploadedFile.type)) {
          throw new AppError(
            `File type ${uploadedFile.type} is not supported`,
            "INVALID_INPUT"
          );
        }

        // Get the actual File object from the URL
        const response = await fetch(uploadedFile.url);
        if (!response.ok) {
          throw new AppError(
            `Failed to fetch file ${uploadedFile.name}`,
            "SERVICE_ERROR"
          );
        }

        const blob = await response.blob();
        const file = new File([blob], uploadedFile.name, {
          type: uploadedFile.type,
        });

        // Convert to Gemini part
        const part = await fileToGenerativePart(file);
        parts.push(part);
      } catch (error) {
        logError(error, `File Processing: ${uploadedFile.name}`);
        if (error instanceof Error) {
          const fileError = error as FileProcessingError;
          fileError.fileName = uploadedFile.name;
          fileError.fileType = uploadedFile.type;
          fileErrors.push(fileError);
        }
        // Continue processing other files
      }
    }

    // If no files were successfully processed but files were provided
    if (parts.length === 1 && files.length > 0) {
      throw new AppError(
        "No files could be processed successfully",
        "SERVICE_ERROR",
        "error",
        { fileErrors }
      );
    }

    try {
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new AppError(
        "Failed to generate response with files",
        "SERVICE_ERROR",
        "error",
        {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
          fileErrors: fileErrors.length > 0 ? fileErrors : undefined,
        }
      );
    }
  } catch (error) {
    logError(error, "Gemini Service");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Failed to generate AI response",
      "SERVICE_ERROR",
      "error",
      {
        originalError: error instanceof Error ? error.message : "Unknown error",
      }
    );
  }
}

// Export types for external use
export type { SupportedMimeType, SupportedImageType, SupportedTextType };
