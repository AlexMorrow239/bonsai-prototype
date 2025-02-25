import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import clsx from "clsx";

import { FileUpload } from "@/components/common/file-upload/FileUpload";
import { FileItem } from "@/components/file-manager/file-item/FileItem";
import { FileManagerBreadcrumb } from "@/components/file-manager/file-manager-breadcrumb/FileManagerBreadcrumb";

import {
  useCreateFolder,
  useFile,
  useFiles,
  useMoveFile,
  useUploadFile,
} from "@/hooks/api/useFiles";
import { useFileManagerStore } from "@/stores/fileManagerStore";
import { useUIStore } from "@/stores/uiStore";
import type { UploadedFile } from "@/types";
import type { FileSystemEntity } from "@/types/filesystem";
import { createFileEntry } from "@/utils/fileUtils";

import "./FileManager.scss";

export const FileManager = (): ReactElement => {
  // Store hooks
  const { showSuccessToast, showErrorToast } = useUIStore();
  const {
    viewMode,
    selectedItems,
    toggleSelectedItem,
    currentDirectory,
    navigateToDirectory,
    setPathItems,
    moveFile,
    clearMovedFile,
  } = useFileManagerStore();

  // Query hooks
  const queryClient = useQueryClient();
  const moveFileMutation = useMoveFile();
  const uploadFileMutation = useUploadFile();
  const createFolderMutation = useCreateFolder();

  // Local state
  const [isDroppingToCurrentDir, setIsDroppingToCurrentDir] = useState(false);
  const [isInternalDragging, setIsInternalDragging] = useState(false);
  const [newFolderName, setNewFolderName] = useState<string | undefined>();
  const dropCounter = useRef(0);

  // Data fetching
  const {
    data: files = [],
    isLoading,
    error,
  } = useFiles({
    parentFolderId: !currentDirectory ? null : currentDirectory,
    isActive: true,
  });

  const { data: currentDirDetails } = useFile(currentDirectory || "", {
    enabled: !!currentDirectory,
  });

  const parentFolderId = currentDirDetails?.parentFolderId || null;
  const { data: parentDetails } = useFile(parentFolderId || "", {
    enabled: !!parentFolderId,
  });

  // File operations handlers
  const handleItemClick = useCallback(
    (file: FileSystemEntity) => {
      toggleSelectedItem(file._id);
    },
    [toggleSelectedItem]
  );

  const handleItemDoubleClick = useCallback(
    (file: FileSystemEntity) => {
      if (file.isFolder) {
        navigateToDirectory(file._id);
        queryClient.invalidateQueries({
          queryKey: ["files", "list", file._id],
        });
        queryClient.invalidateQueries({ queryKey: ["files", file._id] });
      } else if (file.url) {
        // Open file in new tab
        window.open(file.url, "_blank");
      }
    },
    [navigateToDirectory, queryClient]
  );

  // Folder creation handlers
  const handleCreateFolder = useCallback(() => {
    setNewFolderName("New Folder");
  }, []);

  const handleFinishFolderCreation = useCallback(
    async (name: string) => {
      try {
        await createFolderMutation.mutateAsync({
          name,
          originalName: name,
          mimeType: "folder",
          size: 0,
          parentFolderId: currentDirectory || undefined,
        });
        showSuccessToast("Folder created successfully");
      } catch (error) {
        showErrorToast(error);
      } finally {
        setNewFolderName(undefined);
      }
    },
    [createFolderMutation, currentDirectory, showSuccessToast, showErrorToast]
  );

  // File upload handlers
  const handleFileUpload = useCallback(
    async (files: UploadedFile[]) => {
      try {
        for (const uploadedFile of files) {
          if (!uploadedFile.file) continue;

          await uploadFileMutation.mutateAsync({
            file: uploadedFile.file,
            name: uploadedFile.metadata.name,
            parentFolderId: currentDirectory || undefined,
          });
        }

        queryClient.invalidateQueries({
          queryKey: ["files", "list", currentDirectory],
        });

        showSuccessToast("Files uploaded successfully");
      } catch (error) {
        showErrorToast(error, "Failed to upload files");
      }
    },
    [
      uploadFileMutation,
      currentDirectory,
      queryClient,
      showSuccessToast,
      showErrorToast,
    ]
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const types = Array.from(e.dataTransfer.types);
    if (types.includes("Files") && !types.includes("application/json")) {
      dropCounter.current += 1;
      if (dropCounter.current === 1) {
        setIsDroppingToCurrentDir(true);
        setIsInternalDragging(false);
        document.querySelectorAll(".file-item").forEach((item) => {
          (item as HTMLElement).style.pointerEvents = "none";
        });
      }
    } else if (types.includes("application/json")) {
      setIsInternalDragging(true);
      setIsDroppingToCurrentDir(false);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const types = Array.from(e.dataTransfer.types);
    if (types.includes("Files") && !types.includes("application/json")) {
      dropCounter.current -= 1;
      if (dropCounter.current === 0) {
        setIsDroppingToCurrentDir(false);
        document.querySelectorAll(".file-item").forEach((item) => {
          (item as HTMLElement).style.pointerEvents = "auto";
        });
      }
    } else if (types.includes("application/json")) {
      setIsInternalDragging(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const types = Array.from(e.dataTransfer.types);
      if (types.includes("Files") && !types.includes("application/json")) {
        e.dataTransfer.dropEffect = "copy";
        e.stopPropagation();
      } else if (!isDroppingToCurrentDir) {
        e.dataTransfer.dropEffect = "move";
      }
    },
    [isDroppingToCurrentDir]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // Reset all drag states
      setIsDroppingToCurrentDir(false);
      setIsInternalDragging(false);
      dropCounter.current = 0;
      document.querySelectorAll(".file-item").forEach((item) => {
        (item as HTMLElement).style.pointerEvents = "auto";
      });

      const types = Array.from(e.dataTransfer.types);
      if (types.includes("Files") && !types.includes("application/json")) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const uploadedFiles = droppedFiles.map((file) => createFileEntry(file));
        await handleFileUpload(uploadedFiles);
        return;
      }

      if (!isDroppingToCurrentDir) {
        try {
          const dragData = e.dataTransfer.getData("application/json");
          if (!dragData) return;

          const { id: sourceId, parentFolderId: sourceParentId } =
            JSON.parse(dragData);
          if (sourceParentId === currentDirectory) return;

          moveFile(sourceId, currentDirectory);
          await moveFileMutation.mutateAsync({
            fileId: sourceId,
            targetFolderId: currentDirectory,
          });

          queryClient.invalidateQueries({
            queryKey: ["files", "list", sourceParentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["files", "list", currentDirectory],
          });

          clearMovedFile(sourceId);
        } catch (error) {
          showErrorToast(error);
          try {
            const dragData = e.dataTransfer.getData("application/json");
            if (dragData) {
              const { id: sourceId } = JSON.parse(dragData);
              clearMovedFile(sourceId);
            }
          } catch {
            console.error("Failed to revert file move");
          }
        }
      }
    },
    [
      currentDirectory,
      moveFile,
      moveFileMutation,
      queryClient,
      clearMovedFile,
      showErrorToast,
      handleFileUpload,
      isDroppingToCurrentDir,
    ]
  );

  // Path management
  useEffect(() => {
    if (!currentDirectory || !currentDirDetails) {
      setPathItems([]);
      return;
    }

    const path: FileSystemEntity[] = [currentDirDetails];
    if (parentDetails) {
      path.unshift(parentDetails);
    }

    setPathItems(path);
  }, [currentDirectory, currentDirDetails, parentDetails, setPathItems]);

  // Event listeners
  useEffect(() => {
    window.addEventListener("createNewFolder", handleCreateFolder);
    return () => {
      window.removeEventListener("createNewFolder", handleCreateFolder);
    };
  }, [handleCreateFolder]);

  // Loading and error states
  if (isLoading) {
    return (
      <div className="file-manager">
        <FileManagerBreadcrumb />
        <div className="file-manager__content file-manager__content--loading">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-manager">
        <FileManagerBreadcrumb />
        <div className="file-manager__content file-manager__content--error">
          Error loading files. Please try again.
        </div>
      </div>
    );
  }

  // Render helpers
  const renderNewFolder = () => {
    const folder: FileSystemEntity = {
      _id: "new-folder",
      name: newFolderName || "",
      isFolder: true,
      size: 0,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      path: currentDirectory
        ? `${currentDirectory}/${newFolderName}`
        : newFolderName || "",
      parentFolderId: currentDirectory || null,
      isStarred: false,
      isTrashed: false,
      isActive: true,
      mimeType: "application/directory",
    };

    return (
      <FileItem
        key="new-folder"
        file={folder}
        viewMode={viewMode}
        isSelected={false}
        onClick={() => {}}
        onDoubleClick={() => {}}
        onFinishEditing={handleFinishFolderCreation}
        onCancel={() => setNewFolderName(undefined)}
        isEditing={true}
      />
    );
  };

  return (
    <div className="file-manager">
      <FileManagerBreadcrumb />
      <div
        className={clsx("file-manager__content", {
          [`file-manager__content--${viewMode}`]: true,
          "file-manager__content--external-dropping": isDroppingToCurrentDir,
          "file-manager__content--internal-dragging": isInternalDragging,
        })}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={clsx("file-manager__upload", {
            "file-manager__upload--visible": isDroppingToCurrentDir,
          })}
        >
          <div className="file-manager__upload__content">
            <FileUpload
              variant="dropzone"
              isVisible={isDroppingToCurrentDir}
              onFilesSelected={handleFileUpload}
              onError={(error) =>
                showErrorToast(error, "Failed to upload files")
              }
              dropzoneOptions={{
                onDragEnter: handleDragEnter,
                onDragLeave: handleDragLeave,
                onDragOver: handleDragOver,
                onDropAccepted: () => {
                  dropCounter.current = 0;
                  setIsDroppingToCurrentDir(false);
                },
                onDropRejected: (fileRejections) => {
                  dropCounter.current = 0;
                  setIsDroppingToCurrentDir(false);
                  showErrorToast(
                    new Error(
                      fileRejections[0]?.errors[0]?.message ||
                        "Invalid file type"
                    ),
                    "File upload rejected"
                  );
                },
              }}
              dropzoneTitle="Drop files here to upload"
              dropzoneHints={[
                "Files will be uploaded to the current folder",
                "Supported file types: PDF, DOCX, TXT, XLSX, PPTX",
              ]}
            />
          </div>
        </div>
        {newFolderName && renderNewFolder()}
        {files.map((file) => (
          <FileItem
            key={file._id}
            file={file}
            viewMode={viewMode}
            isSelected={selectedItems.includes(file._id)}
            onClick={handleItemClick}
            onDoubleClick={handleItemDoubleClick}
          />
        ))}
      </div>
    </div>
  );
};
