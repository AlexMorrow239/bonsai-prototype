import { ReactNode } from "react";

import { Moon, Plus, Sun } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import { useThemeStore } from "@/stores/themeStore";

import "./ContextTopbar.scss";

interface ContextTopbarProps {
  dropdownSection?: ReactNode;
  onNewItem?: () => void;
  newItemTitle?: string;
}

export function ContextTopbar({
  dropdownSection,
  onNewItem,
  newItemTitle = "New Item",
}: ContextTopbarProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="context-topbar">
      <div className="dropdown-section">{dropdownSection}</div>

      <div className="topbar-actions">
        <Button
          variant="ghost"
          size="sm"
          isIconButton
          title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </Button>

        {onNewItem && (
          <Button
            variant="primary"
            size="sm"
            isIconButton
            title={newItemTitle}
            onClick={onNewItem}
          >
            <Plus size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}
