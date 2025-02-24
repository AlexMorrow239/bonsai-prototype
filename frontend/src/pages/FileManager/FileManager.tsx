import { ReactElement, useEffect, useState } from "react";

import { File, Folder } from "lucide-react";

import { EditableFileName } from "@/components/file-manager/file-item/EditableFileName";
import { FileManagerBreadcrumb } from "@/components/file-manager/file-manager-breadcrumb/FileManagerBreadcrumb";

import { useCreateFolder, useFile, useFiles } from "@/hooks/api/useFiles";
import { useFileManagerStore } from "@/stores/fileManagerStore";
import { useUIStore } from "@/stores/uiStore";
import type { FileSystemEntity } from "@/types/filesystem";
import { formatFileSize } from "@/utils/fileUtils";

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
    parentFolderId: currentDirectory || null,
    isActive: true,
  });

  // Get current directory details if we're not at root
  const { data: currentDirDetails } = useFile(currentDirectory || "");

  // Get parent folder details if we have a current directory
  const parentFolderId = currentDirDetails?.parentFolderId || null;
  const { data: parentDetails } = useFile(parentFolderId || "");

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
      console.log("Navigating to folder:", file._id, file.name);
      navigateToDirectory(file._id);
    } else {
      toggleSelectedItem(file._id);
    }
  };

  const handleItemDoubleClick = (file: FileSystemEntity) => {
    if (file.isFolder) {
      navigateToDirectory(file._id);
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

  const renderListItem = (file: FileSystemEntity) => (
    <div
      key={file._id}
      className={`file-item ${selectedItems.includes(file._id) ? "selected" : ""}`}
      onClick={() => handleItemClick(file)}
      onDoubleClick={() => handleItemDoubleClick(file)}
    >
      <div className="file-item__icon">
        {file.isFolder ? <Folder size={20} /> : <File size={20} />}
      </div>
      <div className="file-item__info">
        <EditableFileName
          initialName={file.name}
          isEditing={false}
          onFinishEditing={() => {}}
          onCancel={() => {}}
        />
        <span className="file-item__size">
          {file.isFolder ? "-" : formatFileSize(file.size)}
        </span>
        <span className="file-item__date">
          {new Date(file.updatedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>
    </div>
  );

  const renderGridItem = (file: FileSystemEntity) => (
    <div
      key={file._id}
      className={`file-item file-item--grid ${
        selectedItems.includes(file._id) ? "selected" : ""
      }`}
      onClick={() => handleItemClick(file)}
      onDoubleClick={() => handleItemDoubleClick(file)}
    >
      <div className="file-item__icon">
        {file.isFolder ? <Folder size={32} /> : <File size={32} />}
      </div>
      <div className="file-item__info">
        <EditableFileName
          initialName={file.name}
          isEditing={false}
          onFinishEditing={() => {}}
          onCancel={() => {}}
        />
        <span className="file-item__details">
          {file.isFolder ? "Folder" : formatFileSize(file.size)}
        </span>
      </div>
    </div>
  );

  const renderNewFolder = () => {
    return viewMode === "list" ? (
      <div key="new-folder" className="file-item">
        <div className="file-item__icon">
          <Folder size={20} />
        </div>
        <div className="file-item__info">
          <EditableFileName
            initialName={newFolderName || ""}
            isEditing={true}
            onFinishEditing={handleFinishFolderCreation}
            onCancel={() => setNewFolderName(undefined)}
          />
          <span className="file-item__size">-</span>
          <span className="file-item__date">Just now</span>
        </div>
      </div>
    ) : (
      <div key="new-folder" className="file-item file-item--grid">
        <div className="file-item__icon">
          <Folder size={32} />
        </div>
        <div className="file-item__info">
          <EditableFileName
            initialName={newFolderName || ""}
            isEditing={true}
            onFinishEditing={handleFinishFolderCreation}
            onCancel={() => setNewFolderName(undefined)}
          />
          <span className="file-item__details">Folder</span>
        </div>
      </div>
    );
  };

  return (
    <div className="file-manager">
      <FileManagerBreadcrumb />
      <div
        className={`file-manager__content file-manager__content--${viewMode}`}
      >
        {newFolderName && renderNewFolder()}
        {files.map((file) =>
          viewMode === "list" ? renderListItem(file) : renderGridItem(file)
        )}
      </div>
    </div>
  );
};
