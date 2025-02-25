import { File, Folder } from "lucide-react";

import { FileSystemEntity } from "@/types/filesystem";
import { formatFileSize } from "@/utils/fileUtils";

import { EditableFileName } from "./editable-filename/EditableFileName";
import "./FileItem.scss";

interface FileItemProps {
  item: FileSystemEntity;
  viewMode: "list" | "grid";
  isSelected: boolean;
  onClick: (item: FileSystemEntity) => void;
  onDoubleClick: (item: FileSystemEntity) => void;
  onFinishEditing?: (name: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const FileItem = ({
  item,
  viewMode,
  isSelected,
  onClick,
  onDoubleClick,
  onFinishEditing,
  onCancel,
  isEditing = false,
}: FileItemProps) => {
  const isGrid = viewMode === "grid";
  const iconSize = isGrid ? 32 : 20;

  const renderIcon = () => (
    <div className="file-item__icon">
      {item.isFolder ? <Folder size={iconSize} /> : <File size={iconSize} />}
    </div>
  );

  const renderDetails = () => {
    if (isGrid) {
      return (
        <span className="file-item__details">
          {item.isFolder ? "Folder" : formatFileSize(item.size)}
        </span>
      );
    }

    return (
      <>
        <span className="file-item__size">
          {item.isFolder ? "-" : formatFileSize(item.size)}
        </span>
        <span className="file-item__date">
          {new Date(item.updatedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </>
    );
  };

  return (
    <div
      className={`file-item ${isGrid ? "file-item--grid" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={() => onClick(item)}
      onDoubleClick={() => onDoubleClick(item)}
    >
      {renderIcon()}
      <div className="file-item__info">
        <EditableFileName
          initialName={item.name}
          isEditing={isEditing}
          onFinishEditing={onFinishEditing || (() => {})}
          onCancel={onCancel || (() => {})}
        />
        {renderDetails()}
      </div>
    </div>
  );
};
