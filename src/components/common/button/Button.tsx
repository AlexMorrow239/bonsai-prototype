import { type ButtonHTMLAttributes, ReactElement, type ReactNode } from "react";

import clsx from "clsx";

import "./Button.scss";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  isIconButton?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  isIconButton = false,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={clsx(
        "button",
        `button--${variant}`,
        `button--${size}`,
        {
          "button--loading": isLoading,
          "button--full-width": fullWidth,
          "button--icon": isIconButton,
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="button__spinner" />}
      {!isLoading && leftIcon && (
        <span className="button__icon button__icon--left">{leftIcon}</span>
      )}
      <span className="button__text">{children}</span>
      {!isLoading && rightIcon && (
        <span className="button__icon button__icon--right">{rightIcon}</span>
      )}
    </button>
  );
}
