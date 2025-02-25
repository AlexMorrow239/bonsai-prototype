import { ReactElement, useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { FileItem } from "@/components/file-manager/file-item/FileItem";
import { FileManagerBreadcrumb } from "@/components/file-manager/file-manager-breadcrumb/FileManagerBreadcrumb";

import { useCreateFolder, useFile, useFiles } from "@/hooks/api/useFiles";
import { useFileManagerStore } from "@/stores/fileManagerStore";
import { useUIStore } from "@/stores/uiStore";
import type { FileSystemEntity } from "@/types/filesystem";

import "./FileManager.scss";

export const FileManager = (): ReactElement => {
  const { showSuccessToast, showErrorToast } = useUIStore();
  const {
    viewMode,
    selectedItems,
    toggleSelectedItem,
    currentDirectory,
    navigateToDirectory,
    setPathItems,
  } = useFileManagerStore();
  const queryClient = useQueryClient();

  const [newFolderName, setNewFolderName] = useState<string | undefined>(
    undefined
  );
  const createFolderMutation = useCreateFolder();

  // Get files from the backend
  const {
    data: files = [],
    isLoading,
    error,
  } = useFiles({
    parentFolderId: !currentDirectory ? null : currentDirectory,
    isActive: true,
  });

  // Get current directory details if we're not at root
  const { data: currentDirDetails } = useFile(currentDirectory || "", {
    enabled: !!currentDirectory,
  });

  // Get parent folder details if we have a current directory
  const parentFolderId = currentDirDetails?.parentFolderId || null;
  const { data: parentDetails } = useFile(parentFolderId || "", {
    enabled: !!parentFolderId,
  });

  // Update path items when directory details change
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

  const handleItemClick = (file: FileSystemEntity) => {
    if (file.isFolder) {
      navigateToDirectory(file._id);
      // Invalidate queries for the new directory
      queryClient.invalidateQueries({ queryKey: ["files", "list", file._id] });
      queryClient.invalidateQueries({ queryKey: ["files", file._id] });
    } else {
      toggleSelectedItem(file._id);
    }
  };

  const handleItemDoubleClick = (file: FileSystemEntity) => {
    if (file.isFolder) {
      handleItemClick(file);
    }
    // TODO: Handle file double click (preview/open file)
  };

  const handleCreateFolder = () => {
    setNewFolderName("New Folder");
  };

  const handleFinishFolderCreation = async (name: string) => {
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
  };

  useEffect(() => {
    const handleCreateNewFolder = () => {
      handleCreateFolder();
    };

    window.addEventListener("createNewFolder", handleCreateNewFolder);
    return () => {
      window.removeEventListener("createNewFolder", handleCreateNewFolder);
    };
  }, []);

  // Show loading state
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

  // Show error state
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
      mimetype: "folder",
    };

    return (
      <FileItem
        key="new-folder"
        item={folder}
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
        className={`file-manager__content file-manager__content--${viewMode}`}
      >
        {newFolderName && renderNewFolder()}
        {files.map((item) => (
          <FileItem
            key={item._id}
            item={item}
            viewMode={viewMode}
            isSelected={selectedItems.includes(item._id)}
            onClick={handleItemClick}
            onDoubleClick={handleItemDoubleClick}
          />
        ))}
      </div>
    </div>
  );
};
