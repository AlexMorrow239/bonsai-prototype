import { ReactElement, useEffect } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useChatsByProject } from "@/hooks/api/useChats";
import { useCreateChat } from "@/hooks/api/useChats";
import { useGetProject } from "@/hooks/api/useProjects";
import { useChatStore } from "@/stores/chatStore";
import { useProjectStore } from "@/stores/projectStore";
import { useToastActions } from "@/stores/uiStore";
import { Chat } from "@/types";

import "./CurrentProject.scss";

export function CurrentProject(): ReactElement {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToastActions();
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);

  const {
    data: project,
    isError,
    error,
    isLoading,
  } = useGetProject(projectId || "");

  const { data: projectChats, isLoading: isChatsLoading } =
    useChatsByProject(projectId);
  const createChatMutation = useCreateChat();

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

  const createNewChat = () => {
    if (!projectId) return;

    createChatMutation.mutate(
      {
        title: `${project?.name || "Project"} Chat`,
        project_id: projectId,
      },
      {
        onSuccess: (newChat) => {
          showSuccessToast("Chat created successfully");
          navigateToChat(newChat);
        },
        onError: (err) => {
          showErrorToast(err);
        },
      }
    );
  };

  const navigateToChat = (chat: Chat) => {
    setCurrentChat(chat);
    navigate(`/chat/${chat._id}`);
  };

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
          </div>
        </section>

        <section className="current-project__section">
          <div className="section-header">
            <h2>Project Chats</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={createNewChat}
              leftIcon={<Plus size={16} />}
            >
              New Chat
            </Button>
          </div>
          <div className="current-project__chats">
            {isChatsLoading ? (
              <div className="loading">Loading chats...</div>
            ) : !projectChats || projectChats.length === 0 ? (
              <div className="empty-state">
                No chats found for this project. Create a new chat to get
                started.
              </div>
            ) : (
              <div className="chat-list">
                {projectChats.map((chat) => (
                  <div
                    key={chat._id}
                    className="chat-item"
                    onClick={() => navigateToChat(chat)}
                  >
                    <div className="chat-icon">
                      <MessageSquare size={18} />
                    </div>
                    <div className="chat-info">
                      <div className="chat-title">{chat.title}</div>
                      {chat.preview && (
                        <div className="chat-preview">{chat.preview}</div>
                      )}
                      <div className="chat-date">
                        {new Date(
                          chat.last_message_at || chat.created_at
                        ).toLocaleDateString()}
                      </div>
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
