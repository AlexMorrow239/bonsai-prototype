import { ReactElement } from "react";

import { useNavigate } from "react-router-dom";

import { useCreateProject } from "@/hooks/api/useProjects";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";
import type { NewProject as NewProjectType } from "@/types/project";

export function NewProject(): ReactElement {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToastActions();
  const { mutateAsync: createProject } = useCreateProject();
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  const handleCreateProject = async (
    projectData: NewProjectType
  ): Promise<void> => {
    try {
      const newProject = await createProject(projectData);
      setCurrentProject(newProject);
      showSuccessToast("Project created successfully");
      navigate(`/project/${newProject._id}`);
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="new-project">
      <h1>Create New Project</h1>
      {/* Add your project creation form here */}
    </div>
  );
}
