import { useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";

import "./Project.scss";

export default function Project() {
  const navigate = useNavigate();
  const { projectId: id } = useParams();
  const { getProjectById, setCurrentProject, currentProject } =
    useProjectStore();
  const { getChatsByProject, setCurrentChat } = useChatStore();

  // Parse the ID and ensure it's a valid number
  const projectId = id ? parseInt(id, 10) : undefined;

  const project = projectId ? getProjectById(projectId) : null;
  const projectChats = projectId ? getChatsByProject(projectId) : [];

  useEffect(() => {
    // Only set current project if it's different from the current one
    if (
      project &&
      (!currentProject || currentProject.project_id !== project.project_id)
    ) {
      setCurrentProject(project.project_id);
    }
  }, [project, currentProject, setCurrentProject]);

  if (!project) {
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

  const formattedCreatedDate = new Date(project.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const formattedLastAccessedDate = new Date(
    project.last_accessed
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="project-page">
      <div className="project-page__header">
        <h1>{project.name}</h1>
        <p className="project-page__description">{project.description}</p>
      </div>

      <div className="project-page__content">
        <section className="project-page__section">
          <div className="section-header">
            <h2>Project Details</h2>
          </div>
          <div className="project-page__details">
            <div className="detail-item">
              <span className="label">Created</span>
              <span className="value">{formattedCreatedDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Last Accessed</span>
              <span className="value">{formattedLastAccessedDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Chats</span>
              <span className="value">{projectChats.length}</span>
            </div>
          </div>
        </section>

        <section className="project-page__section">
          <div className="section-header">
            <h2>Project Chats</h2>
            <div className="header-actions">
              <Button variant="primary" leftIcon={<Plus />}>
                New Chat
              </Button>
            </div>
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
                    key={chat.chatInfo.chat_id}
                    className="chat-item"
                    onClick={() => {
                      setCurrentChat(chat.chatInfo.chat_id);
                      navigate("/chat");
                    }}
                  >
                    <div className="chat-icon">
                      <MessageSquare size={20} />
                    </div>
                    <div className="chat-content">
                      <h3>{chat.chatInfo.title}</h3>
                      <p className="preview">{chat.chatInfo.preview}</p>
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
