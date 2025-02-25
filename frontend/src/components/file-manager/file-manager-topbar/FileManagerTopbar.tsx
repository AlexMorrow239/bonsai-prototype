import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Folder, FolderUp, LayoutGrid, List } from "lucide-react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";
import { FileUpload } from "@/components/common/file-upload/FileUpload";

import { useUploadFile } from "@/hooks/api/useFiles";
import { useFileManagerStore } from "@/stores/fileManagerStore";
import { useUIStore } from "@/stores/uiStore";
import { UploadedFile } from "@/types";

import "./FileManagerTopbar.scss";

export default function FileManagerTopbar() {
  const { showSuccessToast, showErrorToast } = useUIStore();
  const {
    viewMode,
    setViewMode,
    currentDirectory,
    addTemporaryItem,
    removeTemporaryItem,
  } = useFileManagerStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const uploadFileMutation = useUploadFile();
  const queryClient = useQueryClient();

  // Mock selected file/folder state - replace with actual state management
  const selectedItem = null;

  const handleNewFolder = () => {
    try {
      // Emit event to FileManager component
      const event = new CustomEvent("createNewFolder");
      window.dispatchEvent(event);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleFileUpload = async (files: UploadedFile[]) => {
    try {
      // Convert uploaded files to FileSystemEntity format
      const tempFiles = files.map((uploadedFile) => ({
        _id: `temp-file-${Date.now()}-${uploadedFile.metadata.name}`,
        name: uploadedFile.metadata.name,
        isFolder: false,
        size: uploadedFile.metadata.size,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        path: currentDirectory
          ? `${currentDirectory}/${uploadedFile.metadata.name}`
          : uploadedFile.metadata.name,
        parentFolderId: currentDirectory || null,
        isStarred: false,
        isTrashed: false,
        isActive: true,
        mimetype: uploadedFile.metadata.mimetype,
        file: uploadedFile.file, // Keep the original file for upload
      }));

      // Add temporary files to the store
      tempFiles.forEach((tempFile) => addTemporaryItem(tempFile));

      // Upload each file
      for (const tempFile of tempFiles) {
        try {
          await uploadFileMutation.mutateAsync({
            file: tempFile.file,
            name: tempFile.name,
            parentFolderId: currentDirectory || undefined,
          });

          // Remove temporary file after successful upload
          removeTemporaryItem(tempFile._id);
        } catch (error) {
          // Remove temporary file on error
          removeTemporaryItem(tempFile._id);
          throw error;
        }
      }

      // Invalidate queries after all uploads are complete
      queryClient.invalidateQueries({
        queryKey: ["files", "list", currentDirectory],
      });

      showSuccessToast(
        files.length === 1
          ? "File uploaded successfully"
          : `${files.length} files uploaded successfully`
      );
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Implement delete functionality
      showSuccessToast("Item deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleRename = async () => {
    setIsRenaming(true);
    try {
      // TODO: Implement rename functionality
      showSuccessToast("Item renamed successfully");
      setIsRenaming(false);
    } catch (error) {
      showErrorToast(error);
      setIsRenaming(false);
    }
  };

  const fileDropdown = selectedItem && (
    <Dropdown trigger="File Actions" variant="ghost">
      <Button
        variant="ghost"
        fullWidth
        onClick={handleRename}
        disabled={isRenaming}
        leftIcon={<Folder size={16} />}
      >
        Rename
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setIsDeleteModalOpen(true)}
        className="dropdown__item--danger"
      >
        Delete
      </Button>
    </Dropdown>
  );

  const actions = (
    <div className="file-actions">
      <div className="file-actions__view-toggle">
        <Button
          isIconButton
          variant={viewMode === "grid" ? "primary" : "secondary"}
          onClick={() => setViewMode("grid")}
          title="Grid view"
        >
          <LayoutGrid size={18} />
        </Button>
        <Button
          isIconButton
          variant={viewMode === "list" ? "primary" : "secondary"}
          onClick={() => setViewMode("list")}
          title="List view"
        >
          <List size={18} />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNewFolder}
        leftIcon={<Folder size={18} />}
      >
        New Folder
      </Button>
      <FileUpload
        variant="button"
        onFilesSelected={handleFileUpload}
        buttonText="Upload Files"
        leftIcon={<FolderUp size={18} />}
        onError={(error) => showErrorToast(error)}
      />
    </div>
  );

  return (
    <>
      <ContextTopbar
        dropdownSection={
          <>
            {fileDropdown}
            {actions}
          </>
        }
      />

      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        confirmVariant="danger"
      />
    </>
  );
}
