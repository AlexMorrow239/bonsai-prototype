import { create } from "zustand";

import type { ApiErrorCode, Toast as ToastType } from "@/types";
import { handleError, isNetworkError, logError } from "@/utils/errorUtils";

interface UIState {
  // Toast Management
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id">) => void;
  showErrorToast: (error: unknown, context?: string) => void;
  showSuccessToast: (message: string, duration?: number) => void;
  showWarningToast: (message: string, duration?: number) => void;
  showInfoToast: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Global Loading State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Global Error State
  globalError: { code?: ApiErrorCode; message: string } | null;
  setGlobalError: (error: unknown | null) => void;
  clearGlobalError: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Toast State
  toasts: [],

  // Loading State
  isLoading: false,

  // Global Error State
  globalError: null,

  // Toast Actions
  addToast: (toast) => {
    const id = crypto.randomUUID();

    set((state) => {
      // Check for duplicate toasts
      const isDuplicate = state.toasts.some(
        (t) => t.message === toast.message && t.type === toast.type
      );
      if (isDuplicate) return state;

      const maxToasts = 3;
      const newToasts = [...state.toasts, { ...toast, id }].slice(-maxToasts);
      return { toasts: newToasts };
    });

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  showErrorToast: (error: unknown, context?: string) => {
    const appError = handleError(error);
    logError(error, context);

    set((state) => {
      const message = isNetworkError(error)
        ? "Network error. Please check your connection."
        : appError.message;

      const toast = {
        type: "error" as const,
        message,
        duration: 6000, // Longer duration for errors
      };

      const maxToasts = 3;
      const newToasts = [
        ...state.toasts,
        { ...toast, id: crypto.randomUUID() },
      ].slice(-maxToasts);

      return { toasts: newToasts };
    });
  },

  showSuccessToast: (message: string, duration = 3000) => {
    set((state) => {
      const toast = {
        type: "success" as const,
        message,
        duration,
        id: crypto.randomUUID(),
      };

      const maxToasts = 3;
      const newToasts = [...state.toasts, toast].slice(-maxToasts);
      return { toasts: newToasts };
    });
  },

  showWarningToast: (message: string, duration = 4000) => {
    set((state) => {
      const toast = {
        type: "warning" as const,
        message,
        duration,
        id: crypto.randomUUID(),
      };

      const maxToasts = 3;
      const newToasts = [...state.toasts, toast].slice(-maxToasts);
      return { toasts: newToasts };
    });
  },

  showInfoToast: (message: string, duration = 3000) => {
    set((state) => {
      const toast = {
        type: "info" as const,
        message,
        duration,
        id: crypto.randomUUID(),
      };

      const maxToasts = 3;
      const newToasts = [...state.toasts, toast].slice(-maxToasts);
      return { toasts: newToasts };
    });
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),

  // Loading State Actions
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  // Global Error Actions
  setGlobalError: (error: unknown | null) => {
    if (error === null) {
      set({ globalError: null });
      return;
    }

    const appError = handleError(error);
    logError(error, "Global Error");

    set({
      globalError: {
        code: appError.code as ApiErrorCode | undefined,
        message: appError.message,
      },
    });
  },

  clearGlobalError: () => set({ globalError: null }),
}));

// Selector hooks for better performance
export const useToasts = () => useUIStore((state) => state.toasts);
export const useIsLoading = () => useUIStore((state) => state.isLoading);
export const useGlobalError = () => useUIStore((state) => state.globalError);

// Toast action hooks
export const useToastActions = () => {
  const { showErrorToast, showSuccessToast, showWarningToast, showInfoToast } =
    useUIStore();
  return { showErrorToast, showSuccessToast, showWarningToast, showInfoToast };
};
