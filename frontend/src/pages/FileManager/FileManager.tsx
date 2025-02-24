import { ReactElement, useState } from "react";

import { File, Folder, LayoutGrid, List, Plus, Upload } from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { FileUploadTest } from "@/components/features/FileUploadTest";

import "./FileManager.scss";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modifiedDate: string;
}

export const FileManager = (): ReactElement => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data - replace with actual data fetching
  const files: FileItem[] = [
    {
      id: "1",
      name: "Documents",
      type: "folder",
      modifiedDate: "2024-02-24",
    },
    {
      id: "2",
      name: "Project Files",
      type: "folder",
      modifiedDate: "2024-02-23",
    },
    {
      id: "3",
      name: "report.pdf",
      type: "file",
      size: "2.5 MB",
      modifiedDate: "2024-02-22",
    },
  ];

  const handleItemClick = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="file-manager">
      <div className="file-manager__header">
        <div className="file-manager__actions">
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            New
          </Button>
          <Button variant="secondary" leftIcon={<Upload size={18} />}>
            Upload
          </Button>
        </div>
        <div className="file-manager__view-toggle">
          <Button
            isIconButton
            variant={viewMode === "grid" ? "primary" : "secondary"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={18} />
          </Button>
          <Button
            isIconButton
            variant={viewMode === "list" ? "primary" : "secondary"}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <FileUploadTest />
      </div>

      <div
        className={`file-manager__content file-manager__content--${viewMode}`}
      >
        {files.map((file) => (
          <div
            key={file.id}
            className={`file-item ${
              selectedItems.includes(file.id) ? "selected" : ""
            }`}
            onClick={() => handleItemClick(file.id)}
          >
            <div className="file-item__icon">
              {file.type === "folder" ? (
                <Folder size={24} />
              ) : (
                <File size={24} />
              )}
            </div>
            <div className="file-item__info">
              <span className="file-item__name">{file.name}</span>
              {viewMode === "list" && (
                <>
                  <span className="file-item__type">{file.type}</span>
                  <span className="file-item__size">{file.size}</span>
                  <span className="file-item__date">{file.modifiedDate}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
