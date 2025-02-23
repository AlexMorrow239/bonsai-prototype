import React, { useRef } from "react";

import { Upload } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { FILE_CONSTRAINTS, getAllowedTypes } from "@/common/constants";

import { useFileStore } from "@/stores/fileStore";
import { useUIStore } from "@/stores/uiStore";
import { getAllFilesFromDataTransfer } from "@/utils/files/fileTransfer";
import { createFileEntry } from "@/utils/files/fileUpload";
import { validateFiles } from "@/utils/files/fileValidation";

import "./FileUpload.scss";

interface FileUploadProps {
  chatId: string;
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
  const { addPendingFiles, getPendingFiles } = useFileStore();
  const { addToast } = useUIStore();
  const files = getPendingFiles(chatId);
  const acceptedFileTypes = getAllowedTypes();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    try {
      // Get files from input or drop event, including directory contents
      const selectedFiles = await getAllFilesFromDataTransfer(
        "dataTransfer" in event ? event.dataTransfer : event.target
      );

      if (selectedFiles.length === 0) {
        addToast({
          type: "info",
          message: "No valid files found",
        });
        return;
      }

      // Validate files using the validation utility
      const validation = validateFiles(selectedFiles, files);

      if (!validation.valid) {
        addToast({
          type: "error",
          message: validation.error || "Invalid files",
        });
        return;
      }

      // Create UploadedFile objects for each selected file
      const uploadedFiles = selectedFiles.map((file) =>
        createFileEntry(file, chatId)
      );

      // Add files to store
      await addPendingFiles(chatId, uploadedFiles);

      // Clear the input after successful addition
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("File upload error:", error);
      addToast({
        type: "error",
        message: "Failed to process files",
      });
    }
  };

  // Handle drag and drop events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (
    event: React.DragEvent<HTMLDivElement>
  ): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
    await handleFileSelect(event);
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory=""
        directory=""
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
