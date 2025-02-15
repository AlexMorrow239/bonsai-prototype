import { type ReactElement } from "react";

import * as RadixToast from "@radix-ui/react-toast";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useUIStore } from "@/stores/uiStore";

import "./Toast.scss";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast(): ReactElement {
  const { toasts, removeToast } = useUIStore();

  return (
    <RadixToast.Provider swipeDirection="right">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <RadixToast.Root
            key={toast.id}
            className={`toast toast--${toast.type}`}
            onOpenChange={(open) => !open && removeToast(toast.id)}
          >
            <Icon className="toast__icon" aria-hidden="true" />
            <RadixToast.Description className="toast__message">
              {toast.message}
            </RadixToast.Description>
            <RadixToast.Close
              className="toast__close"
              aria-label="Close notification"
            >
              <X size={16} />
            </RadixToast.Close>
          </RadixToast.Root>
        );
      })}
      <RadixToast.Viewport className="toast-container" />
    </RadixToast.Provider>
  );
}
