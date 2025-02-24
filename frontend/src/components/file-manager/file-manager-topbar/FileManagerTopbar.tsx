import { useRef, useState } from "react";

import { Folder, FolderUp, LayoutGrid, List } from "lucide-react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useUploadFile } from "@/hooks/api/useFiles";
import { useFileManagerStore } from "@/stores/fileManagerStore";
import { useUIStore } from "@/stores/uiStore";

import "./FileManagerTopbar.scss";

export default function FileManagerTopbar() {
  const { showSuccessToast, showErrorToast } = useUIStore();
  const { viewMode, setViewMode, currentDirectory } = useFileManagerStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = useUploadFile();

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

  const handleUploadFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      // Upload each file
      for (const file of files) {
        await uploadFileMutation.mutateAsync({
          file,
          name: file.name,
          parentFolderId: currentDirectory || undefined,
        });
      }

      showSuccessToast(
        files.length === 1
          ? "File uploaded successfully"
          : `${files.length} files uploaded successfully`
      );
    } catch (error) {
      showErrorToast(error);
    } finally {
      // Reset the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUploadFiles}
        leftIcon={<FolderUp size={18} />}
      >
        Upload Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        style={{ display: "none" }}
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
