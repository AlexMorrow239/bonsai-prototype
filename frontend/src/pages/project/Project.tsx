import { useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useProjects } from "@/hooks/api/useProjects";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";

import "./Project.scss";

export default function Project() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { data: projectsData, isLoading } = useProjects();
  const { getChatsByProject, setCurrentChat, createNewChat } = useChatStore();
  const { setProjects, currentProject, archiveProject } = useProjectStore();

  // Update projects in store when API data changes
  useEffect(() => {
    if (projectsData?.data) {
      setProjects(projectsData.data);
    }
  }, [projectsData, setProjects]);

  // Set current project based on URL param
  useEffect(() => {
    if (projectsData?.data && projectId) {
      const project = projectsData.data.find((p) => p._id === projectId);
      if (!project) {
        navigate("/projects");
      }
    }
  }, [projectsData, projectId, navigate]);

  const projectChats = projectId ? getChatsByProject(projectId) : [];

  const handleNewChat = () => {
    createNewChat("New Chat", projectId, navigate);
  };

  const handleArchiveProject = async () => {
    if (!projectId) return;

    try {
      await archiveProject(projectId);
      navigate("/projects");
    } catch (error) {
      console.error("Failed to archive project:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="project-page">
        <div className="project-page__loading">Loading project details...</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="project-page">
        <div className="project-page__error">
          <h2>Project not found</h2>
          <p>
            The project you're looking for doesn't exist or has been deleted.
            Try checking your projects list or creating a new project.
          </p>
          <Link to="/projects" className="project-action-button">
            <ArrowLeft />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const formattedCreatedDate = new Date(
    currentProject.created_at
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedUpdatedDate = new Date(
    currentProject.updated_at || currentProject.created_at
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="project-page">
      <div className="project-page__header">
        <h1>{currentProject.name}</h1>
        <p className="project-page__description">
          {currentProject.description}
        </p>
      </div>

      <div className="project-page__content">
        <section className="project-page__section">
          <div className="section-header">
            <h2>Project Details</h2>
            {currentProject.is_active && (
              <div className="header-actions">
                <Button variant="secondary" onClick={handleArchiveProject}>
                  Archive Project
                </Button>
              </div>
            )}
          </div>
          <div className="project-page__details">
            <div className="detail-item">
              <span className="label">Created</span>
              <span className="value">{formattedCreatedDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Last Updated</span>
              <span className="value">{formattedUpdatedDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Chats</span>
              <span className="value">{projectChats.length}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status</span>
              <span className="value">
                {currentProject.is_active ? "Active" : "Archived"}
              </span>
            </div>
          </div>
        </section>

        <section className="project-page__section">
          <div className="section-header">
            <h2>Project Chats</h2>
            {currentProject.is_active && (
              <div className="header-actions">
                <Button
                  variant="primary"
                  leftIcon={<Plus />}
                  onClick={handleNewChat}
                >
                  New Chat
                </Button>
              </div>
            )}
          </div>
          <div className="project-page__chats">
            {projectChats.length === 0 ? (
              <p className="empty-state">
                No chats in this project yet. Create your first chat to get
                started.
              </p>
            ) : (
              <div className="chat-list">
                {projectChats.map((chat) => (
                  <div
                    key={chat._id}
                    className="chat-item"
                    onClick={() => {
                      setCurrentChat(chat._id);
                      navigate("/chat");
                    }}
                  >
                    <div className="chat-icon">
                      <MessageSquare size={20} />
                    </div>
                    <div className="chat-content">
                      <h3>{chat.title}</h3>
                      <p className="preview">{chat.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
