import { create } from "zustand";

import type { Toast as ToastType } from "@/types";

interface UIState {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id =
      Math.random().toString(36).substring(2) + Date.now().toString(36);

    set((state) => {
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
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
