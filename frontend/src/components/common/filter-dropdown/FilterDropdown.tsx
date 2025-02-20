import { useEffect, useRef } from "react";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
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
        <span>{selected || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="select-icon" size={16} />
        </motion.div>{" "}
      </div>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="categories-dropdown__menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
            exit={{
              opacity: 0,
              y: -5,
              scale: 0.98,
              transition: {
                duration: 0.15,
                ease: "easeIn",
              },
            }}
          >
            <div className="categories-dropdown__search">
              <Search size={16} />
              <motion.input
                initial={{ scale: 0.98 }}
                animate={{
                  scale: 1,
                  transition: {
                    duration: 0.15,
                    ease: "easeOut",
                  },
                }}
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>

            <motion.div
              className="categories-dropdown__options"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  delay: 0.05,
                  duration: 0.2,
                },
              }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
