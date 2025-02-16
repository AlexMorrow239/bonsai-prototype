import React from "react";

import { FileIcon, Link2 } from "lucide-react";

import { Message, UploadedFile } from "@/types";
import { formatFileSize } from "@/utils/fileUtils";

import "./ChatArea.scss";

interface MessageFileProps {
  file: UploadedFile;
}

const MessageFile = ({ file }: MessageFileProps) => (
  <div className="message-file">
    <FileIcon size={16} className="message-file__icon" />
    <div className="message-file__info">
      <div className="message-file__name">{file.name}</div>
      <div className="message-file__meta">{formatFileSize(file.size)}</div>
    </div>
    {file.url && (
      <a
        href={file.url}
        download={file.name}
        className="message-file__download"
        title="Download file"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Link2 size={14} />
      </a>
    )}
  </div>
);

const MessageFiles = ({ files }: { files: UploadedFile[] }) => {
  if (!files?.length) return null;

  return (
    <div className="message-files">
      {files.map((file) => (
        <MessageFile key={file.file_id} file={file} />
      ))}
    </div>
  );
};

interface ChatAreaProps {
  messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps): React.ReactNode {
  const renderMessage = (msg: Message) => (
    <div
      key={msg.message_id}
      className={`message ${msg.is_ai_response ? "ai" : "user"}`}
    >
      {msg.content && <div className="message-content">{msg.content}</div>}
      {msg.files && <MessageFiles files={msg.files} />}
      <div className="message-timestamp">
        {new Date(msg.created_at).toLocaleTimeString()}
      </div>
    </div>
  );

  return <div className="chat-messages">{messages.map(renderMessage)}</div>;
}
