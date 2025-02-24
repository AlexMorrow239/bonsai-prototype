import { ReactElement } from "react";

import { ChevronRight, Home } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useFileManagerStore } from "@/stores/fileManagerStore";

import "./FileManagerBreadcrumb.scss";

export function FileManagerBreadcrumb(): ReactElement {
  const { pathItems, navigateToDirectory } = useFileManagerStore();

  return (
    <div className="file-breadcrumb">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateToDirectory(null)}
        className="file-breadcrumb__home"
        title="Go to root directory"
      >
        <Home size={18} />
      </Button>

      {pathItems.length > 0 && <ChevronRight size={16} className="separator" />}

      {pathItems.map((item, index) => (
        <div key={item._id} className="file-breadcrumb__item">
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
