import { useState } from "react";

import { Folder, FolderUp } from "lucide-react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useUIStore } from "@/stores/uiStore";

import "./FileManagerTopbar.scss";

export default function FileManagerTopbar() {
  const { showSuccessToast, showErrorToast } = useUIStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // Mock selected file/folder state - replace with actual state management
  const selectedItem = null;

  const handleNewFolder = async () => {
    try {
      // TODO: Implement new folder creation
      showSuccessToast("New folder created");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleUploadFiles = async () => {
    try {
      // TODO: Implement file upload
      showSuccessToast("Files uploaded successfully");
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
