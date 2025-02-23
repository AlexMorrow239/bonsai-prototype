import { useEffect } from "react";

import { Upload } from "lucide-react";
import type { DropEvent, FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/common/button/Button";

import { FILE_CONSTRAINTS } from "@/common/constants";

import { useFileStore } from "@/stores/fileStore";
import { useUIStore } from "@/stores/uiStore";
import { createFileEntry } from "@/utils/files/fileUpload";

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
  const { addPendingFiles, setDragging } = useFileStore();
  const { addToast } = useUIStore();

  const handleFilesSelected = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => {
    console.debug("[FileUpload] Files selected:", {
      acceptedCount: acceptedFiles.length,
      rejectedCount: fileRejections.length,
      acceptedFiles: acceptedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
      })),
      rejectedFiles: fileRejections.map((r) => ({
        file: {
          name: r.file.name,
          size: r.file.size,
          type: r.file.type,
          lastModified: r.file.lastModified,
        },
        errors: r.errors,
      })),
      eventType: event.type,
    });

    try {
      // Process accepted files
      if (acceptedFiles.length === 0) {
        console.debug("[FileUpload] No accepted files found");
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
      const uploadedFiles = acceptedFiles.map((file) => {
        console.debug("[FileUpload] Creating file entry for:", {
          name: file.name,
          type: file.type,
          size: file.size,
        });
        return createFileEntry(file, chatId);
      });

      console.debug("[FileUpload] Created file entries:", {
        count: uploadedFiles.length,
        files: uploadedFiles.map((f) => ({
          id: f.file_id,
          name: f.metadata.name,
          size: f.metadata.size,
          type: f.metadata.mimetype,
        })),
      });

      // Add files to store
      await addPendingFiles(chatId, uploadedFiles);
      console.debug("[FileUpload] Files added to store successfully");
    } catch (error) {
      console.error("[FileUpload] File upload error:", {
        error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      addToast({
        type: "error",
        message: "Failed to process files",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
  });

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
            <Upload size={32} />
            <p>Drop files here</p>
            <span className="file-upload__dropzone-hint">
              Up to {maxFiles} files supported
            </span>
            <span className="file-upload__dropzone-hint">
              Max size: {FILE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-upload file-upload--compact" {...getRootProps()}>
      <input {...getInputProps()} className="file-upload__input" />
      <Button
        variant="ghost"
        size="sm"
        isIconButton
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        title={`Upload files (max ${maxFiles})`}
      >
        <Upload size={16} />
      </Button>
    </div>
  );
}
