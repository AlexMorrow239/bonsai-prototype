import type { ReactNode } from "react";

import { FileIcon, Link2 } from "lucide-react";

import { FileServerData } from "@/types";
import { formatFileSize } from "@/utils/files/fileFormat";

import "./MessageFiles.scss";

interface MessageFileProps {
  file: FileServerData;
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
  files: FileServerData[];
}

export function MessageFiles({ files }: MessageFilesProps) {
  if (!files?.length) return null;

  return (
    <div className="message-files ">
      {files.map((file) => (
        <MessageFile key={file._id} file={file} />
      ))}
    </div>
  );
}
