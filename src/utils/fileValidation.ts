import { FILE_CONSTRAINTS } from "@/common/constants";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFiles(
  files: File[],
  existingFiles: { file_id: string }[]
): FileValidationResult {
  // Filter out system files and get valid files with inferred types
  const validFiles = files.filter((file) => {
    if (file.name.startsWith(".")) return false;

    // Check if file has a valid type or can be inferred
    if (!file.type) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext) return false;

      const inferredType = inferFileType(ext);
      return FILE_CONSTRAINTS.ALLOWED_TYPES.some((type) =>
        inferredType.startsWith(type)
      );
    }
    return true;
  });

  if (validFiles.length === 0) {
    return {
      valid: false,
      error: "No valid files found to upload",
    };
  }

  if (validFiles.length + existingFiles.length > FILE_CONSTRAINTS.MAX_FILES) {
    return {
      valid: false,
      error: `You can only upload up to ${FILE_CONSTRAINTS.MAX_FILES} files at once`,
    };
  }

  for (const file of validFiles) {
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File ${file.name} exceeds the 10MB size limit`,
      };
    }

    if (
      !FILE_CONSTRAINTS.ALLOWED_TYPES.some((type) => file.type.startsWith(type))
    ) {
      return {
        valid: false,
        error: `File type ${file.type || "unknown"} is not supported`,
      };
    }
  }

  return { valid: true };
}

function inferFileType(extension: string): string {
  const typeMap: Record<string, string> = {
    txt: "text/plain",
    json: "application/json",
    xml: "application/xml",
    pdf: "application/pdf",
  };

  return typeMap[extension] || "";
}
