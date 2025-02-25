import { useEffect } from "react";
import type { ReactNode } from "react";

import { Upload } from "lucide-react";
import type { DropzoneOptions, FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/common/button/Button";

import { FILE_CONSTRAINTS } from "@/common/constants";

import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { UploadedFile } from "@/types";
import { createFileEntry } from "@/utils/fileUtils";

import "./FileUpload.scss";

interface FileUploadProps {
  // Core props
  onFilesSelected: (files: UploadedFile[]) => Promise<void>;
  variant?: "icon" | "dropzone" | "button";
  maxFiles?: number;
  isVisible?: boolean;

  // Dropzone configuration
  dropzoneOptions?: Partial<DropzoneOptions>;

  // UI customization
  buttonTitle?: string;
  buttonText?: string;
  dropzoneTitle?: string;
  dropzoneHints?: string[];
  iconSize?: number;
  leftIcon?: ReactNode;

  // Error handling
  onError?: (error: Error) => void;
}

export function FileUpload({
  onFilesSelected,
  variant = "icon",
  maxFiles = FILE_CONSTRAINTS.MAX_FILES,
  isVisible = false,
  dropzoneOptions = {},
  buttonTitle = `Upload files (max ${maxFiles})`,
  buttonText,
  dropzoneTitle = "Drop files here",
  dropzoneHints = [
    `Up to ${maxFiles} files supported`,
    `Max size: ${FILE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  ],
  iconSize = variant === "icon" ? 16 : 32,
  leftIcon,
  onError = (error) => {
    console.error("[FileUpload] File upload error:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  },
}: FileUploadProps) {
  const { setDragging } = useChatStore();
  const { addToast } = useUIStore();

  const handleFilesSelected = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    try {
      // Process accepted files
      if (acceptedFiles.length === 0) {
        if (fileRejections.length > 0) {
          // Already handled by onDropRejected
          return;
        }
        addToast({
          type: "info",
          message: "No valid files found",
        });
        return;
      }

      // Create UploadedFile objects for each selected file
      const uploadedFiles = acceptedFiles.map((file) => createFileEntry(file));
      await onFilesSelected(uploadedFiles);
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
      addToast({
        type: "error",
        message: "Failed to process files",
      });
    }
  };

  const defaultDropzoneConfig: DropzoneOptions = {
    onDrop: handleFilesSelected,
    maxFiles,
    noClick: variant === "dropzone",
    noKeyboard: variant === "dropzone",
    noDrag: variant === "dropzone",
    preventDropOnDocument: false,
    useFsAccessApi: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
    multiple: true,
    validator: (file) => {
      // Check if this is an internal drag operation
      if (
        file instanceof DataTransferItem &&
        file.type === "application/json"
      ) {
        return {
          code: "internal-drag",
          message:
            "Internal file moves are not handled by the upload component",
        };
      }
      return null;
    },
    onDragEnter: (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (dropzoneOptions.onDragEnter) {
        dropzoneOptions.onDragEnter(event);
      }
    },
    onDragOver: (event) => {
      event.preventDefault();
      event.stopPropagation();
      // Always show copy icon for file uploads
      event.dataTransfer.dropEffect = "copy";
      if (dropzoneOptions.onDragOver) {
        dropzoneOptions.onDragOver(event);
      }
    },
    onDragLeave: (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (dropzoneOptions.onDragLeave) {
        dropzoneOptions.onDragLeave(event);
      }
    },
    ...dropzoneOptions,
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone(
    defaultDropzoneConfig
  );

  // Reset dragging state when component unmounts
  useEffect(() => {
    return () => setDragging(false);
  }, [setDragging]);

  if (variant === "dropzone") {
    return (
      <div
        className={`file-upload file-upload--dropzone ${isVisible ? "file-upload--visible" : ""}`}
      >
        <div className="file-upload__dropzone">
          <div
            className={`file-upload__dropzone-content ${isDragActive ? "dragging" : ""}`}
          >
            <Upload size={iconSize} />
            <p>{dropzoneTitle}</p>
            {dropzoneHints.map((hint, index) => (
              <span key={index} className="file-upload__dropzone-hint">
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <div className="file-upload file-upload--button" {...getRootProps()}>
        <input {...getInputProps()} className="file-upload__input" />
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          leftIcon={leftIcon}
          title={buttonTitle}
        >
          {buttonText}
        </Button>
      </div>
    );
  }

  return (
    <div className="file-upload file-upload--icon" {...getRootProps()}>
      <input {...getInputProps()} className="file-upload__input" />
      <Button
        variant="ghost"
        size="sm"
        isIconButton
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        title={buttonTitle}
      >
        <Upload size={iconSize} />
      </Button>
    </div>
  );
}
