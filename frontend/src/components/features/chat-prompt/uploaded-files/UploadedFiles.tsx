import { ReactNode } from "react";

import {
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
import { formatFileSize } from "@/utils/files";

import "./UploadedFiles.scss";

interface UploadedFilesProps {
  chatId: string;
}

export function UploadedFiles({ chatId }: UploadedFilesProps): ReactNode {
  const { getFilesByChatId, removeFile } = useFileStore();
  const files = getFilesByChatId(chatId);

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

  return (
    <div className="uploaded-files">
      <div className="uploaded-files__list">
        {files.map((file) => (
          <div key={file.file_id} className="uploaded-files__item">
            {renderFileIcon(file.file.type)}
            <span className="uploaded-files__filename" title={file.file.name}>
              {file.file.name}
            </span>
            <span className="uploaded-files__size">
              {formatFileSize(file.file.size)}
            </span>
            <Button
              type="button"
              onClick={() => removeFile(chatId, file.file_id)}
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
