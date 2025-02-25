import { ReactNode } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { FileIcon } from "@/components/common/file-icon/FileIcon";

import { useChatStore } from "@/stores/chatStore";
import { formatFileSize } from "@/utils/fileUtils";

import "./UploadedFiles.scss";

interface UploadedFilesProps {
  chatId: string | null;
}

export function UploadedFiles({ chatId }: UploadedFilesProps): ReactNode {
  const { getPendingFiles, removePendingFile } = useChatStore();
  const files = getPendingFiles(chatId);

  if (files.length === 0) return null;

  return (
    <div className="uploaded-files">
      <div className="uploaded-files__list">
        {files.map((file) => (
          <div key={file.file_id} className="uploaded-files__item">
            <FileIcon
              mimetype={file.metadata.mimetype}
              size={14}
              className="uploaded-files__icon"
            />
            <span
              className="uploaded-files__filename"
              title={file.metadata.name}
            >
              {file.metadata.name}
            </span>
            <span className="uploaded-files__size">
              {formatFileSize(file.metadata.size)}
            </span>
            <Button
              type="button"
              onClick={() => removePendingFile(chatId, file.file_id)}
              className="uploaded-files__remove"
              isIconButton={true}
              title="Remove file"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
