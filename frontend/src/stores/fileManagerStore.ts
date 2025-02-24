import { create } from "zustand";

import type { FileSystemEntity } from "@/types/filesystem";

interface FileManagerState {
  viewMode: "grid" | "list";
  selectedItems: string[];
  currentDirectory: string | null;
  pathItems: FileSystemEntity[];

  // Actions
  setViewMode: (mode: "grid" | "list") => void;
  setSelectedItems: (items: string[]) => void;
  toggleSelectedItem: (id: string) => void;
  clearSelectedItems: () => void;
  navigateToDirectory: (directoryId: string | null) => void;
  navigateUp: () => void;
  setPathItems: (items: FileSystemEntity[]) => void;
}

export const useFileManagerStore = create<FileManagerState>((set, get) => ({
  viewMode: "list",
  selectedItems: [],
  currentDirectory: null,
  pathItems: [],

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedItems: (items) => set({ selectedItems: items }),

  toggleSelectedItem: (id) =>
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((item) => item !== id)
        : [...state.selectedItems, id],
    })),

  clearSelectedItems: () => set({ selectedItems: [] }),

  setPathItems: (items) => set({ pathItems: items }),

  navigateToDirectory: (directoryId) => {
    set({ currentDirectory: directoryId, selectedItems: [] });
  },

  navigateUp: () => {
    const { pathItems } = get();
    if (pathItems.length <= 1) {
      set({ currentDirectory: null, selectedItems: [] });
      return;
    }
    const parentDirectory = pathItems[pathItems.length - 2];
    set({ currentDirectory: parentDirectory._id, selectedItems: [] });
  },
}));
