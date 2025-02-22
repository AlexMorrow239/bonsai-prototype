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
      <div className="message-file__name">{file.metadata.name}</div>
      <div className="message-file__meta">
        {formatFileSize(file.metadata.size)}
      </div>
    </div>
    {file.metadata.url && (
      <a
        href={file.metadata.url}
        download={file.metadata.name}
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
  if (!files?.length) return null;

  return (
    <div className="message-files ">
      {files.map((file) => (
        <MessageFile key={file.file_id} file={file} />
      ))}
    </div>
  );
}
