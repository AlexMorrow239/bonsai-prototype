import type { ReactNode } from "react";

import clsx from "clsx";
import { HTMLMotionProps, motion } from "framer-motion";

import "./Button.scss";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
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
}: ButtonProps): ReactNode {
  return (
    <motion.button
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
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {isLoading && (
        <motion.span
          className="button__spinner"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        />
      )}
      {!isLoading && leftIcon && (
        <motion.span
          className="button__icon button__icon--left"
          initial={{ x: -5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {leftIcon}
        </motion.span>
      )}
      <motion.span
        className="button__text"
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      {!isLoading && rightIcon && (
        <motion.span
          className="button__icon button__icon--right"
          initial={{ x: 5, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {rightIcon}
        </motion.span>
      )}
    </motion.button>
  );
}
