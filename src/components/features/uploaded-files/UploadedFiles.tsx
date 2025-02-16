import { ReactNode } from "react";

import { X } from "lucide-react";

import { useFileStore } from "@/stores/fileStore";

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
      case "uploading":
        return (
          <span className="uploaded-files__status">
            Uploading... {status.progress}%
          </span>
        );
      case "error":
        return (
          <span className="uploaded-files__status uploaded-files__status--error">
            {status.error}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="uploaded-files">
      <div className="uploaded-files__list">
        {files.map((file) => (
          <div key={file.file_id} className="uploaded-files__item">
            <span className="uploaded-files__filename">{file.name}</span>
            {renderUploadStatus(file.file_id)}
            <button
              type="button"
              className="uploaded-files__remove"
              onClick={() => removeFile(chatId, file.file_id)}
              disabled={file.uploadStatus.status === "uploading"}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
