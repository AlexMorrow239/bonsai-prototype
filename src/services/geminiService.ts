import { GoogleGenerativeAI, Part } from "@google/generative-ai";

import { UploadedFile } from "@/types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Helper function to convert file to base64
async function fileToGenerativePart(file: File): Promise<Part> {
  const mimeType = file.type;

  // Handle images
  if (mimeType.startsWith("image/")) {
    const data = await file.arrayBuffer();
    const bytes = new Uint8Array(data);

    // Convert to base64 in chunks to avoid call stack issues
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
      inlineData: {
        data: base64,
        mimeType,
      },
    };
  }

  // Handle text files
  if (mimeType === "text/plain") {
    const text = await file.text();
    return { text };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

export async function generateGeminiResponse(
  prompt: string,
  files?: UploadedFile[]
): Promise<string> {
  try {
    // For text-only messages, use gemini-pro
    if (!files || files.length === 0) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert files to Gemini parts
    const parts: Part[] = [];

    // Add the text prompt
    parts.push({ text: prompt });

    // Process each file
    for (const uploadedFile of files) {
      try {
        // Get the actual File object from the URL
        const response = await fetch(uploadedFile.url!);
        const blob = await response.blob();
        const file = new File([blob], uploadedFile.name, {
          type: uploadedFile.type,
        });

        // Convert to Gemini part
        const part = await fileToGenerativePart(file);
        parts.push(part);
      } catch (error) {
        console.error(`Error processing file ${uploadedFile.name}:`, error);
        // Continue with other files if one fails
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw new Error("Failed to generate AI response");
  }
}

// Helper to check if file type is supported by Gemini
export function isFileTypeSupported(mimeType: string): boolean {
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "text/plain",
  ];

  return supportedTypes.includes(mimeType);
}
