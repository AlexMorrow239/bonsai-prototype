import clsx from "clsx";

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
  onItemClick: (itemId: string) => void;
  renderItemContent: (item: ItemConfig) => React.ReactNode;
  buttonClassName?: string;
  leftIcon?: React.ReactNode;
}

export function SidebarSection({
  title,
  items,
  isExpanded,
  onToggleExpand,
  currentItemId,
  onItemClick,
  renderItemContent,
  buttonClassName = "generic-item",
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
        items.map((item) => {
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={clsx(buttonClassName, {
                active: currentItemId === item.id,
              })}
              onClick={() => {
                onItemClick(item.id);
              }}
              leftIcon={leftIcon}
            >
              {renderItemContent(item)}
            </Button>
          );
        })}
    </>
  );
}
