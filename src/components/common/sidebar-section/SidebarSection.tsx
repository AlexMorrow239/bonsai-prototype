import { Button } from "@/components/common/button/Button";

import "./SidebarSection.scss";

interface ItemConfig {
  id: number;
  title: string;
}

interface SidebarSectionProps {
  title: string;
  items: ItemConfig[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentItemId?: number;
  isRenaming: number | null;
  onItemClick: (itemId: number) => void;
  renderItemContent: (item: ItemConfig) => React.ReactNode;
  buttonClassName?: string;
  disableClickWhenRenaming?: boolean;
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
  buttonClassName = "chat-item",
  disableClickWhenRenaming = true,
}: SidebarSectionProps) {
  if (items.length === 0) return null;

  return (
    <>
      <div className="list-header" onClick={onToggleExpand}>
        <h3>{title}</h3>
        <span className="toggle">{isExpanded ? "−" : "+"}</span>
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
          >
            {renderItemContent(item)}
          </Button>
        ))}
    </>
  );
}
