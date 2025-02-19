import { ReactElement } from "react";

import { Button } from "../button/Button";
import { Modal } from "../modal/Modal";
import "./ActionModal.scss";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmVariant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmVariant = "primary",
  size = "sm",
}: ActionModalProps): ReactElement {
  const footer = (
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size={size}
      description={description}
    />
  );
}
