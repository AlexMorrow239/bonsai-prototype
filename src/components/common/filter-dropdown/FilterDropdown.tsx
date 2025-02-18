import { useEffect, useRef } from "react";

import clsx from "clsx";
import { ChevronDown, Search } from "lucide-react";

import "./FilterDropDown.scss";

interface FilterDropdownProps {
  isOpen: boolean;
  selected: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggle: () => void;
  onSelect: (value: string) => void;
  unselectedItems: string[];
  placeholder: string;
  searchPlaceholder: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  selected,
  searchValue,
  onSearchChange,
  onToggle,
  onSelect,
  unselectedItems,
  placeholder,
  searchPlaceholder,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return (): void =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div
      ref={dropdownRef}
      className={clsx("categories-dropdown", {
        "categories-dropdown--open": isOpen,
      })}
    >
      <div className="categories-dropdown__selected" onClick={onToggle}>
        <span>
          {selected || placeholder} {/* Changed to show single selection */}
        </span>
        <ChevronDown className="select-icon" size={16} />
      </div>

      {isOpen && (
        <div className="categories-dropdown__menu">
          <div className="categories-dropdown__search">
            <Search size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>

          <div className="categories-dropdown__options">
            <div
              className="categories-dropdown__option"
              onClick={() => {
                onSelect(""); // Empty string to indicate "All Projects"
                onToggle();
              }}
            >
              <span>All Projects</span>
            </div>

            {unselectedItems
              .filter((item) =>
                item.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((item) => (
                <div
                  key={item}
                  className="categories-dropdown__option"
                  onClick={() => {
                    onSelect(item);
                    onToggle();
                  }}
                >
                  <span>{item}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
