import { ReactElement, type ReactNode } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "../button/Button";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps): ReactElement {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={`modal modal--${size}`}>
          <div className="modal__header">
            <Dialog.Title className="modal__title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="sm"
                className="modal__close"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="modal__content">{children}</div>
          {footer && <div className="modal__footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
