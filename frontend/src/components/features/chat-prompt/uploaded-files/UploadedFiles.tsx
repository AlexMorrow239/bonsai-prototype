import { ReactNode } from "react";

import {
  AlertCircle,
  Check,
  FileAudio,
  FileIcon,
  FileImage,
  FilePen,
  FileText,
  FileVideo,
  X,
} from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useFileStore } from "@/stores/fileStore";
import { UploadedFile } from "@/types";
import { formatFileSize } from "@/utils/files";

import "./UploadedFiles.scss";

interface UploadedFilesProps {
  chatId: string;
}

export function UploadedFiles({ chatId }: UploadedFilesProps): ReactNode {
  const { getPendingFiles, removePendingFile } = useFileStore();
  const files = getPendingFiles(chatId);

  if (files.length === 0) return null;

  const renderFileIcon = (fileType: string) => {
    const iconProps = { size: 14, className: "uploaded-files__icon" };

    if (fileType.startsWith("image/")) {
      return <FileImage {...iconProps} />;
    }
    if (fileType.startsWith("video/")) {
      return <FileVideo {...iconProps} />;
    }
    if (fileType.startsWith("audio/")) {
      return <FileAudio {...iconProps} />;
    }
    if (fileType === "application/pdf") {
      return <FilePen {...iconProps} />;
    }
    if (fileType.startsWith("text/")) {
      return <FileText {...iconProps} />;
    }

    return <FileIcon {...iconProps} />;
  };

  const renderFileStatus = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return (
          <div className="uploaded-files__status">
            <span
              className="progress-bar"
              style={{ width: `${file.progress}%` }}
            />
            <span className="status-text">{file.progress}%</span>
          </div>
        );
      case "error":
        return (
          <div className="uploaded-files__status error">
            <AlertCircle size={14} />
            <span>Upload failed</span>
          </div>
        );
      case "complete":
        return (
          <div className="uploaded-files__status success">
            <Check size={14} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="uploaded-files">
      <div className="uploaded-files__list">
        {files.map((file) => (
          <div
            key={file.file_id}
            className={`uploaded-files__item ${file.status ? `status-${file.status}` : ""}`}
          >
            {renderFileIcon(file.metadata.mimetype)}
            <span
              className="uploaded-files__filename"
              title={file.metadata.name}
            >
              {file.metadata.name}
            </span>
            <span className="uploaded-files__size">
              {formatFileSize(file.metadata.size)}
            </span>
            {renderFileStatus(file)}
            <Button
              type="button"
              onClick={() => removePendingFile(chatId, file.file_id)}
              className="uploaded-files__remove"
              isIconButton={true}
              title="Remove file"
              disabled={file.status === "uploading"}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
