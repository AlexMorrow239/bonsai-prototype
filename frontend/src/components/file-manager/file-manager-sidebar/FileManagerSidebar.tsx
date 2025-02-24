import { ReactElement, useState } from "react";

import {
  Clock,
  FileBox,
  Folder,
  FolderHeart,
  HardDrive,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/common/button/Button";
import { SidebarSection } from "@/components/common/sidebar-section/SidebarSection";

import "./FileManagerSidebar.scss";

interface QuickAccessItem {
  id: string;
  title: string;
  icon?: ReactElement;
}

const quickAccessItems: QuickAccessItem[] = [
  { id: "home", title: "Home", icon: <HardDrive size={16} /> },
  { id: "documents", title: "Documents", icon: <FileBox size={16} /> },
  { id: "favorites", title: "Favorites", icon: <Star size={16} /> },
  { id: "trash", title: "Trash", icon: <Trash2 size={16} /> },
];

const recentFolders = [
  { id: "recent1", title: "Project Assets" },
  { id: "recent2", title: "Design Files" },
  { id: "recent3", title: "Documents 2024" },
];

const favoriteFolders = [
  { id: "fav1", title: "Important Documents" },
  { id: "fav2", title: "Work Projects" },
  { id: "fav3", title: "Personal Files" },
];

export function FileManagerSidebar(): ReactElement {
  const [expandedSections, setExpandedSections] = useState({
    quickAccess: true,
    recent: true,
    favorites: true,
  });

  const [currentLocation, setCurrentLocation] = useState("home");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleQuickAccessClick = (itemId: string) => {
    setCurrentLocation(itemId);
    // TODO: Implement navigation/filtering based on quick access selection
  };

  const handleFolderClick = (folderId: string) => {
    // TODO: Implement folder navigation
  };

  return (
    <div className="file-manager-sidebar">
      <div className="file-manager-sidebar__sections">
        <SidebarSection
          title="Quick Access"
          items={quickAccessItems}
          isExpanded={expandedSections.quickAccess}
          onToggleExpand={() => toggleSection("quickAccess")}
          currentItemId={currentLocation}
          isRenaming={null}
          onItemClick={handleQuickAccessClick}
          buttonClassName="quick-access-item"
          renderItemContent={(item: QuickAccessItem) => (
            <div className="quick-access-item__content">
              {item.icon}
              <span>{item.title}</span>
            </div>
          )}
        />

        <SidebarSection
          title="Recent"
          items={recentFolders}
          isExpanded={expandedSections.recent}
          onToggleExpand={() => toggleSection("recent")}
          currentItemId={currentLocation}
          isRenaming={null}
          onItemClick={handleFolderClick}
          buttonClassName="folder-item"
          leftIcon={<Clock size={16} />}
          renderItemContent={(item) => <span>{item.title}</span>}
        />

        <SidebarSection
          title="Favorites"
          items={favoriteFolders}
          isExpanded={expandedSections.favorites}
          onToggleExpand={() => toggleSection("favorites")}
          currentItemId={currentLocation}
          isRenaming={null}
          onItemClick={handleFolderClick}
          buttonClassName="folder-item"
          leftIcon={<FolderHeart size={16} />}
          renderItemContent={(item) => <span>{item.title}</span>}
        />
      </div>

      <div className="file-manager-sidebar__storage">
        <div className="storage-info">
          <div className="storage-info__text">
            <span className="storage-info__used">75.5 GB</span>
            <span className="storage-info__total">of 100 GB</span>
          </div>
          <div className="storage-info__bar">
            <div
              className="storage-info__progress"
              style={{ width: "75.5%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
