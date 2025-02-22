import { ReactElement, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { useCreateProject } from "@/hooks/api/useProjects";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";
import type { NewProject as NewProjectType } from "@/types/project";

import "./NewProject.scss";

export function NewProject(): ReactElement {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToastActions();
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  const [formData, setFormData] = useState<NewProjectType>({
    name: "",
    description: "",
    is_active: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast("Project name is required");
      return;
    }

    try {
      const newProject = await createProject(formData);
      setCurrentProject(newProject);
      showSuccessToast("Project created successfully");
      navigate(`/project/${newProject._id}`);
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="new-project">
      <div className="new-project__header">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
        <h1>Create New Project</h1>
        <p className="new-project__description">
          Create a new project to organize your conversations and files.
        </p>
      </div>

      <div className="new-project__content">
        <form onSubmit={handleSubmit} className="new-project__form">
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter project description"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="form-actions">
            <Link to="/" className="button button--secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="button button--primary"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
