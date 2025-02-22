import { Button } from "@/components/common/button/Button";

import "./SidebarSection.scss";

interface ItemConfig {
  id: string;
  title: string;
}

interface SidebarSectionProps {
  title: string;
  items: ItemConfig[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentItemId?: string;
  isRenaming: string | null;
  onItemClick: (itemId: string) => void;
  renderItemContent: (item: ItemConfig) => React.ReactNode;
  buttonClassName?: string;
  disableClickWhenRenaming?: boolean;
  leftIcon?: React.ReactNode;
}

export function SidebarSection({
  title,
  items,
  isExpanded,
  onToggleExpand,
  currentItemId,
  isRenaming,
  onItemClick,
  renderItemContent,
  buttonClassName = "generic-item",
  disableClickWhenRenaming = true,
  leftIcon,
}: SidebarSectionProps) {
  if (items.length === 0) return null;

  return (
    <>
      <div className="list-header" onClick={onToggleExpand}>
        <h3>{title}</h3>
        <span className="toggle">{isExpanded ? "-" : "+"}</span>
      </div>
      {isExpanded &&
        items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`${buttonClassName} ${
              currentItemId === item.id ? "active" : ""
            }`}
            onClick={() =>
              disableClickWhenRenaming && isRenaming
                ? null
                : onItemClick(item.id)
            }
            leftIcon={leftIcon}
          >
            {renderItemContent(item)}
          </Button>
        ))}
    </>
  );
}
