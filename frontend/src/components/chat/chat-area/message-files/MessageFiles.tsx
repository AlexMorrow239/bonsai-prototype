import type { ReactNode } from "react";

import { Link2 } from "lucide-react";

import { FileIcon } from "@/components/common/file-icon/FileIcon";

import type { FileServerData, UploadedFile } from "@/types";
import { formatFileSize } from "@/utils/fileUtils";

import "./MessageFiles.scss";

type MessageFile = FileServerData | UploadedFile;

interface MessageFileProps {
  file: MessageFile;
}

const MessageFile = ({ file }: MessageFileProps): ReactNode => {
  // Handle both uploaded and server files
  const fileName = "metadata" in file ? file.metadata.name : file.name;
  const fileSize = "metadata" in file ? file.metadata.size : file.size;
  const fileUrl = "url" in file ? file.url : undefined;
  const mimetype = "metadata" in file ? file.metadata.mimetype : file.mimetype;

  const handleClick = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`message-file ${fileUrl ? "clickable" : ""}`}
      onClick={handleClick}
      role={fileUrl ? "button" : undefined}
      title={fileUrl ? "Click to open file" : "File not available"}
    >
      <FileIcon mimetype={mimetype} size={16} className="message-file__icon" />
      <div className="message-file__info">
        <div className="message-file__name">{fileName}</div>
        <div className="message-file__meta">{formatFileSize(fileSize)}</div>
      </div>
      {fileUrl && (
        <div className="message-file__download" title="Download file">
          <Link2 size={14} />
        </div>
      )}
    </div>
  );
};

interface MessageFilesProps {
  files: MessageFile[];
}

export function MessageFiles({ files }: MessageFilesProps) {
  if (!files?.length) return null;

  return (
    <div className="message-files">
      {files.map((file) => {
        const fileId = "file_id" in file ? file.file_id : file._id;
        return <MessageFile key={fileId} file={file} />;
      })}
    </div>
  );
}
