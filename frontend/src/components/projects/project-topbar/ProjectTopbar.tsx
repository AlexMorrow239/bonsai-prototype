import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useDeleteProject, useUpdateProject } from "@/hooks/api/useProjects";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";

export default function ProjectTopbar() {
  const navigate = useNavigate();
  const { currentProject, clearCurrentProject } = useProjectStore();
  const { showSuccessToast, showErrorToast } = useToastActions();
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] =
    useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // API mutations
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();

  const handleNewProject = () => {
    try {
      navigate("/project/new");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject?._id) return;

    try {
      await deleteProjectMutation.mutateAsync(currentProject._id);
      showSuccessToast("Project deleted successfully");
      setIsDeleteProjectModalOpen(false);
      clearCurrentProject();
      navigate("/project/new");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleRenameProject = async () => {
    if (!currentProject?._id) return;
    setIsRenaming(true);

    try {
      await updateProjectMutation.mutateAsync({
        _id: currentProject._id,
        name: "Renamed Project", // You'll want to add a proper rename input UI
      });
      setIsRenaming(false);
      showSuccessToast("Project renamed successfully");
    } catch (error) {
      showErrorToast(error);
      setIsRenaming(false);
    }
  };

  const projectDropdown = currentProject && (
    <Dropdown trigger="Edit Project" variant="ghost">
      <Button
        variant="ghost"
        fullWidth
        onClick={handleRenameProject}
        disabled={isRenaming}
      >
        Rename
      </Button>
      <Button
        variant="ghost"
        fullWidth
        className="dropdown__item--danger"
        onClick={() => setIsDeleteProjectModalOpen(true)}
      >
        Delete
      </Button>
    </Dropdown>
  );

  return (
    <>
      <ContextTopbar
        dropdownSection={projectDropdown}
        onNewItem={handleNewProject}
        newItemTitle="Create new project"
      />

      <ActionModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        title="Delete Project"
        description="All associated chats will be deleted. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteProject}
        confirmVariant="danger"
      />
    </>
  );
}
