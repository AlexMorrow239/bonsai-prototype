import { ReactElement, useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { useGetProject } from "@/hooks/api/useProjects";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";

import "./CurrentProject.scss";

export function CurrentProject(): ReactElement {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showErrorToast } = useToastActions();

  const {
    data: project,
    isError,
    error,
    isLoading,
  } = useGetProject(projectId || "");
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  useEffect(() => {
    if (isError) {
      showErrorToast(error);
      navigate("/");
    }
  }, [isError, error, navigate, showErrorToast]);

  if (isLoading) {
    return (
      <div className="current-project">
        <div className="current-project__loading">
          Loading project details...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="current-project">
        <div className="current-project__error">
          <h2>Project not found</h2>
          <p>
            The project you're looking for doesn't exist or has been deleted.
            Try checking your projects list or creating a new project.
          </p>
          <Link to="/" className="project-action-button">
            <ArrowLeft />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const formattedCreatedDate = new Date(project.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedUpdatedDate = new Date(
    project.updated_at || project.created_at
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="current-project">
      <div className="current-project__header">
        <h1>{project.name}</h1>
        <p className="current-project__description">{project.description}</p>
      </div>

      <div className="current-project__content">
        <section className="current-project__section">
          <div className="section-header">
            <h2>Project Details</h2>
          </div>
          <div className="current-project__details">
            <div className="detail-item">
              <span className="label">Created</span>
              <span className="value">{formattedCreatedDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Last Updated</span>
              <span className="value">{formattedUpdatedDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status</span>
              <span className="value">
                {project.is_active ? "Active" : "Archived"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
