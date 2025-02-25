import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { File, Folder } from "lucide-react";

import { useMoveFile } from "@/hooks/api/useFiles";
import { useFileManagerStore } from "@/stores/fileManagerStore";
import { useUIStore } from "@/stores/uiStore";
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
  const clickTimeout = useRef<number | null>(null);
  const touchTimeout = useRef<number | null>(null);
  const isTouchDevice = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const dragCounter = useRef(0);

  const queryClient = useQueryClient();
  const { showErrorToast } = useUIStore();
  const { currentDirectory, moveFile, clearMovedFile, isFileMovedFrom } =
    useFileManagerStore();
  const moveFileMutation = useMoveFile();

  // Hide item if it has been moved from this directory
  const isHidden = isFileMovedFrom(item._id, currentDirectory);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent click handling on touch devices to avoid double triggering
      if (isTouchDevice.current) return;

      if (clickTimeout.current) {
        // Double click detected
        window.clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
        onDoubleClick(item);
      } else {
        // First click - wait for potential second click
        clickTimeout.current = window.setTimeout(() => {
          clickTimeout.current = null;
          onClick(item);
        }, 200);
      }
    },
    [item, onClick, onDoubleClick]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isEditing || isHidden) return;

      setIsDragging(true);
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          id: item._id,
          name: item.name,
          isFolder: item.isFolder,
          parentFolderId: currentDirectory,
        })
      );
      e.dataTransfer.effectAllowed = "move";

      // Create a custom drag image
      const dragImage = document.createElement("div");
      dragImage.className = "file-item__drag-image";
      dragImage.innerHTML = `
        <div class="file-item__drag-icon">
          ${
            item.isFolder
              ? '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
              : '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
          }
        </div>
        <span>${item.name}</span>
      `;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      requestAnimationFrame(() => {
        document.body.removeChild(dragImage);
      });
    },
    [item, isEditing, isHidden, currentDirectory]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // Only handle drag enter for folders
      if (!item.isFolder || isEditing || isDragging) return;

      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        setIsDropTarget(true);
      }
    },
    [item.isFolder, isEditing, isDragging]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDropTarget(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // Only show drop effect for folders
      if (!item.isFolder || isEditing || isDragging) return;
      e.dataTransfer.dropEffect = "move";
    },
    [item.isFolder, isEditing, isDragging]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropTarget(false);
      dragCounter.current = 0;

      if (!item.isFolder || isEditing) return;

      try {
        const dragData = e.dataTransfer.getData("application/json");
        if (!dragData) return;

        const { id: sourceId, parentFolderId: sourceParentId } =
          JSON.parse(dragData);
        if (sourceId === item._id) return; // Can't drop on itself

        // Optimistically update UI
        moveFile(sourceId, item._id);

        // Update server
        await moveFileMutation.mutateAsync({
          fileId: sourceId,
          targetFolderId: item._id,
        });

        // Invalidate queries for both source and target directories
        queryClient.invalidateQueries({
          queryKey: ["files", "list", sourceParentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["files", "list", item._id],
        });

        // Clear optimistic state after successful move
        clearMovedFile(sourceId);
      } catch (error) {
        showErrorToast(error);
        // Revert optimistic update on error
        clearMovedFile(item._id);
      }
    },
    [
      item,
      isEditing,
      moveFile,
      moveFileMutation,
      queryClient,
      clearMovedFile,
      showErrorToast,
    ]
  );

  const handleTouchStart = useCallback(() => {
    isTouchDevice.current = true;
    if (touchTimeout.current) {
      window.clearTimeout(touchTimeout.current);
    }
    touchTimeout.current = window.setTimeout(() => {
      touchTimeout.current = null;
    }, 200);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (touchTimeout.current) {
        // Quick tap - handle as single click
        window.clearTimeout(touchTimeout.current);
        touchTimeout.current = null;
        onClick(item);
      } else {
        // Long press - handle as double click
        onDoubleClick(item);
      }
    },
    [item, onClick, onDoubleClick]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(item);
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        onDoubleClick(item);
      }
    },
    [item, onClick, onDoubleClick]
  );

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

  if (isHidden) {
    return null;
  }

  return (
    <div
      className={`file-item ${isGrid ? "file-item--grid" : ""} ${
        isSelected ? "selected" : ""
      } ${isDragging ? "dragging" : ""} ${isDropTarget ? "drop-target" : ""}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
      role="button"
      aria-selected={isSelected}
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
