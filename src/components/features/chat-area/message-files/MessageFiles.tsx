import type { ReactNode } from "react";

import { FileIcon, Link2 } from "lucide-react";

import { UploadedFile } from "@/types";
import { formatFileSize } from "@/utils/files";

import "./MessageFiles.scss";

interface MessageFileProps {
  file: UploadedFile;
}

const MessageFile = ({ file }: MessageFileProps): ReactNode => (
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

interface MessageFilesProps {
  files: UploadedFile[];
}

export function MessageFiles({ files }: MessageFilesProps) {
  // Validation check for files with errors
  const hasErrorFiles = files?.some(
    (file) => file.uploadStatus.status === "error"
  );

  if (!files?.length) return null;

  return (
    <div
      className={`message-files ${hasErrorFiles ? "message-files--has-errors" : ""}`}
    >
      {hasErrorFiles && (
        <div className="message-files__error-banner">
          One or more files failed to upload. Please remove failed files before
          sending.
        </div>
      )}
      {files.map((file) => (
        <MessageFile key={file.file_id} file={file} />
      ))}
    </div>
  );
}
