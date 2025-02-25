import { ReactElement } from "react";

import {
  FileIcon as DefaultFileIcon,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FilePen,
  FileText,
  FileVideo,
  Folder,
} from "lucide-react";

export interface FileIconProps {
  /**
   * The mimetype of the file (e.g. 'image/jpeg', 'video/mp4', etc.)
   * If not provided, will render a default file icon
   */
  mimetype?: string;
  /**
   * Whether the item is a folder
   */
  isFolder?: boolean;
  /**
   * Size of the icon in pixels
   * @default 24
   */
  size?: number;
  /**
   * Additional CSS class name
   */
  className?: string;
}

export function FileIcon({
  mimetype,
  isFolder,
  size = 24,
  className,
}: FileIconProps): ReactElement {
  // console.log(mimetype);
  const iconProps = {
    size,
    className,
  };

  if (isFolder) {
    return <Folder {...iconProps} />;
  }

  // Handle different file types based on mimetype
  if (mimetype) {
    // Images
    if (mimetype.startsWith("image/")) {
      return <FileImage {...iconProps} />;
    }

    // Videos
    if (mimetype.startsWith("video/")) {
      return <FileVideo {...iconProps} />;
    }

    // Audio
    if (mimetype.startsWith("audio/")) {
      return <FileAudio {...iconProps} />;
    }

    // Application types
    if (mimetype.startsWith("application/")) {
      // PDFs
      if (mimetype === "application/pdf") {
        return <FilePen {...iconProps} />;
      }

      // JSON files
      if (mimetype === "application/json") {
        return <FileJson {...iconProps} />;
      }

      // Code files
      if (
        mimetype === "application/javascript" ||
        mimetype === "application/typescript" ||
        mimetype === "application/x-python" ||
        mimetype === "application/x-java" ||
        mimetype === "application/x-ruby"
      ) {
        return <FileCode {...iconProps} />;
      }
    }

    // Text files
    if (mimetype.startsWith("text/")) {
      // Code files
      if (
        mimetype === "text/javascript" ||
        mimetype === "text/typescript" ||
        mimetype === "text/x-python" ||
        mimetype === "text/x-java" ||
        mimetype === "text/x-c" ||
        mimetype === "text/x-cpp" ||
        mimetype === "text/x-ruby" ||
        mimetype === "text/x-perl" ||
        mimetype === "text/x-yaml" ||
        mimetype === "text/x-sh" ||
        mimetype.includes("code") ||
        mimetype.includes("script")
      ) {
        return <FileCode {...iconProps} />;
      }

      // Default text files
      return <FileText {...iconProps} />;
    }
  }

  // Default file icon for unknown types
  return <DefaultFileIcon {...iconProps} />;
}
