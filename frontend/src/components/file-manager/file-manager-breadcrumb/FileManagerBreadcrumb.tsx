import { ReactElement, useCallback, useRef, useState } from "react";

import { ChevronRight, Home } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useFileManagerStore } from "@/stores/fileManagerStore";

import "./FileManagerBreadcrumb.scss";

const HOVER_DELAY = 800; // 800ms delay before navigation

export function FileManagerBreadcrumb(): ReactElement {
  const { pathItems, navigateToDirectory } = useFileManagerStore();
  const navigationTimer = useRef<number | null>(null);
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null);

  const clearNavigationTimer = useCallback(() => {
    if (navigationTimer.current) {
      window.clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }
  }, []);

  const handleDragEnter = useCallback(
    (directoryId: string | null) => {
      setDraggingOverId(directoryId);
      clearNavigationTimer();

      navigationTimer.current = window.setTimeout(() => {
        navigateToDirectory(directoryId);
        setDraggingOverId(null);
      }, HOVER_DELAY);
    },
    [navigateToDirectory, clearNavigationTimer]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      // Only clear if we're actually leaving the element (not entering a child)
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDraggingOverId(null);
        clearNavigationTimer();
      }
    },
    [clearNavigationTimer]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingOverId(null);
      clearNavigationTimer();
    },
    [clearNavigationTimer]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div
      className="file-breadcrumb"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-dragging-over={draggingOverId === null ? undefined : true}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateToDirectory(null)}
        onDragEnter={() => handleDragEnter(null)}
        onDragLeave={handleDragLeave}
        className="file-breadcrumb__home"
        title="Go to root directory"
        data-dragging-over={draggingOverId === null ? true : undefined}
      >
        <Home size={18} />
      </Button>

      {pathItems.length > 0 && <ChevronRight size={16} className="separator" />}

      {pathItems.map((item, index) => (
        <div
          key={item._id}
          className="file-breadcrumb__item"
          onDragEnter={() => handleDragEnter(item._id)}
          onDragLeave={handleDragLeave}
          data-dragging-over={draggingOverId === item._id ? true : undefined}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToDirectory(item._id)}
          >
            {item.name}
          </Button>
          {index < pathItems.length - 1 && (
            <ChevronRight size={16} className="separator" />
          )}
        </div>
      ))}
    </div>
  );
}
