import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import React from "react";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/common/button/Button";

import "./Dropdown.scss";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
}

export function Dropdown({
  trigger,
  children,
  align = "left",
  className = "",
  variant = "outline",
}: DropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={clsx("dropdown", className)} ref={dropdownRef}>
      <Button
        variant={variant}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        rightIcon={
          <ChevronDown
            size={16}
            className={clsx("dropdown__chevron", {
              "dropdown__chevron--open": isOpen,
            })}
          />
        }
      >
        {trigger}
      </Button>
      {isOpen && (
        <div className={clsx("dropdown__menu", `dropdown__menu--${align}`)}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Type assertion for the child element
              const childElement = child as React.ReactElement<{
                className?: string;
                onClick?: () => void;
              }>;

              return React.cloneElement(childElement, {
                className: clsx("dropdown__item", {
                  "dropdown__item--danger":
                    childElement.props.className?.includes("danger"),
                }),
                onClick: () => {
                  childElement.props.onClick?.();
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}
