import { ReactNode } from "react";

import {
  CheckCircle2,
  FileAudio,
  FileIcon,
  FileImage,
  FilePen,
  FileText,
  FileVideo,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useFileStore } from "@/stores/fileStore";
import { formatFileSize, formatTimeRemaining } from "@/utils/files";

import "./UploadedFiles.scss";

interface UploadedFilesProps {
  chatId: number;
}

export function UploadedFiles({ chatId }: UploadedFilesProps): ReactNode {
  const { getFilesByChatId, removeFile, getUploadStatus } = useFileStore();
  const files = getFilesByChatId(chatId);

  if (files.length === 0) return null;

  const renderUploadStatus = (fileId: string) => {
    const status = getUploadStatus(fileId);
    if (!status) return null;

    switch (status.status) {
      case "uploading": {
        const speedText = status.uploadSpeed
          ? `${formatFileSize(status.uploadSpeed)}/s`
          : "";
        const progressText =
          status.uploadedSize && status.totalSize
            ? `${formatFileSize(status.uploadedSize)} of ${formatFileSize(status.totalSize)}`
            : `${status.progress}%`;
        const timeText = status.remainingTime
          ? formatTimeRemaining(status.remainingTime)
          : "";

        return (
          <span className="uploaded-files__status uploaded-files__status--uploading">
            <Loader2 size={14} />
            <span>
              Uploading... {progressText}
              {(speedText || timeText) && (
                <span className="uploaded-files__meta">
                  {speedText && (
                    <span className="uploaded-files__speed">{speedText}</span>
                  )}
                  {speedText && timeText && " • "}
                  {timeText && (
                    <span className="uploaded-files__time">
                      {timeText} remaining
                    </span>
                  )}
                </span>
              )}
            </span>
            <div className="uploaded-files__progress">
              <div
                className="uploaded-files__progress-bar"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </span>
        );
      }

      case "completed": {
        const uploadTime =
          status.completedAt && status.startTime
            ? `(${formatTimeRemaining(status.completedAt - status.startTime)})`
            : "";

        return (
          <span className="uploaded-files__status uploaded-files__status--success">
            <CheckCircle2 size={14} />
            <span>
              Upload complete
              <span className="uploaded-files__meta">
                {status.totalSize && formatFileSize(status.totalSize)}
                {uploadTime && ` • ${uploadTime}`}
              </span>
            </span>
          </span>
        );
      }

      case "error":
        return (
          <span className="uploaded-files__status uploaded-files__status--error">
            <XCircle size={14} />
            <span>
              {status.error || "Upload failed"}
              {status.failedAt && status.startTime && (
                <span className="uploaded-files__meta">
                  after{" "}
                  {formatTimeRemaining(status.failedAt - status.startTime)}
                </span>
              )}
            </span>
          </span>
        );

      default:
        return null;
    }
  };

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

  return (
    <div className="uploaded-files">
      <div className="uploaded-files__list">
        {files.map((file) => (
          <div
            key={file.file_id}
            className={`uploaded-files__item uploaded-files__item--${file.uploadStatus.status}`}
          >
            {renderFileIcon(file.type)}
            <span className="uploaded-files__filename" title={file.name}>
              {file.name}
            </span>
            {renderUploadStatus(file.file_id)}
            <Button
              type="button"
              onClick={() => removeFile(chatId, file.file_id)}
              disabled={file.uploadStatus.status === "uploading"}
              className="uploaded-files__remove"
              isIconButton={true}
              title={
                file.uploadStatus.status === "uploading"
                  ? "Upload in progress"
                  : "Remove file"
              }
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
