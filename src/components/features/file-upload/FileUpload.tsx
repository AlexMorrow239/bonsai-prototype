import React, { useRef } from "react";

import { Upload } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { FILE_CONSTRAINTS } from "@/common/constants";

import { useFileStore } from "@/stores/fileStore";
import { useUIStore } from "@/stores/uiStore";
import { validateFiles } from "@/utils/fileValidation";

import "./FileUpload.scss";

interface FileUploadProps {
  chatId: number;
  variant?: "compact" | "dropzone";
  maxFiles?: number;
  isVisible?: boolean;
}

export function FileUpload({
  chatId,
  variant = "compact",
  maxFiles = FILE_CONSTRAINTS.MAX_FILES,
  isVisible = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles, getFilesByChatId } = useFileStore();
  const { addToast } = useUIStore();
  const files = getFilesByChatId(chatId);
  const acceptedFileTypes = FILE_CONSTRAINTS.ALLOWED_TYPES;

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFiles = Array.from(event.target.files || []);

    // Validate files using the validation utility
    const validation = validateFiles(newFiles, files);

    if (!validation.valid) {
      addToast({
        type: "error",
        message: validation.error || "Invalid files",
      });
      return;
    }

    try {
      await addFiles(chatId, newFiles);

      // Clear the input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to upload files",
      });
    }
  };

  // Convert allowed types to input accept format
  const acceptedFormats = [...acceptedFileTypes]
    .map((type) => (type.endsWith("/") ? `${type}*` : type))
    .join(",");

  return (
    <div
      className={`file-upload file-upload--${variant} ${
        variant === "dropzone" && isVisible ? "file-upload--visible" : ""
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats}
        onChange={handleFileSelect}
        className="file-upload__input"
      />
      {variant === "compact" ? (
        <Button
          variant="ghost"
          size="sm"
          isIconButton
          onClick={() => fileInputRef.current?.click()}
          title={`Upload files (max ${maxFiles})`}
        >
          <Upload size={16} />
        </Button>
      ) : (
        <div
          className="file-upload__dropzone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="file-upload__dropzone-content">
            <Upload size={32} />
            <p>Drop files here or click to upload</p>
            <span className="file-upload__dropzone-hint">
              Up to {maxFiles} files supported
            </span>
            <span className="file-upload__dropzone-hint">
              Max size: {FILE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
