import { useState } from "react";

import { ActionModal } from "@/components/common/action-modal/ActionModal";
import { Button } from "@/components/common/button/Button";
import { ContextTopbar } from "@/components/common/context-topbar/ContextTopbar";
import { Dropdown } from "@/components/common/dropdown/Dropdown";

import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

export default function ProjectTopbar() {
  const { currentProject, deleteProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] =
    useState(false);

  const handleDeleteProject = () => {
    if (!currentProject) return;
    deleteProject(currentProject.project_id);
    addToast({ type: "success", message: "Project deleted successfully" });
    setIsDeleteProjectModalOpen(false);
  };

  const projectDropdown = currentProject && (
    <Dropdown trigger="Edit Project" variant="ghost">
      <Button variant="ghost" fullWidth>
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
