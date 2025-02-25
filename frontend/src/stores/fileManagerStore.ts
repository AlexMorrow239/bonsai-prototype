import { create } from "zustand";

import type { FileSystemEntity } from "@/types/filesystem";

interface FileManagerState {
  viewMode: "grid" | "list";
  selectedItems: string[];
  currentDirectory: string | null;
  pathItems: FileSystemEntity[];
  movedFiles: Record<string, string | null>; // Track moved files for optimistic updates
  temporaryItems: Record<string, FileSystemEntity>; // Track temporary items for optimistic updates

  // Actions
  setViewMode: (mode: "grid" | "list") => void;
  setSelectedItems: (items: string[]) => void;
  toggleSelectedItem: (id: string) => void;
  clearSelectedItems: () => void;
  navigateToDirectory: (directoryId: string | null) => void;
  navigateUp: () => void;
  setPathItems: (items: FileSystemEntity[]) => void;
  moveFile: (fileId: string, targetFolderId: string | null) => void;
  clearMovedFile: (fileId: string) => void;
  isFileMovedFrom: (fileId: string, currentFolderId: string | null) => boolean;
  isFileMovedTo: (fileId: string, targetFolderId: string | null) => boolean;
  addTemporaryItem: (item: FileSystemEntity) => void;
  removeTemporaryItem: (itemId: string) => void;
  getTemporaryItems: (parentFolderId: string | null) => FileSystemEntity[];
}

export const useFileManagerStore = create<FileManagerState>((set, get) => ({
  viewMode: "list",
  selectedItems: [],
  currentDirectory: null,
  pathItems: [],
  movedFiles: {},
  temporaryItems: {},

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

  // File moving actions
  moveFile: (fileId, targetFolderId) =>
    set((state) => ({
      movedFiles: {
        ...state.movedFiles,
        [fileId]: targetFolderId,
      },
    })),

  clearMovedFile: (fileId) =>
    set((state) => {
      const { [fileId]: _, ...remainingMoves } = state.movedFiles;
      return { movedFiles: remainingMoves };
    }),

  isFileMovedFrom: (fileId, currentFolderId) => {
    const { movedFiles } = get();
    return (
      movedFiles[fileId] !== undefined && movedFiles[fileId] !== currentFolderId
    );
  },

  isFileMovedTo: (fileId, targetFolderId) => {
    const { movedFiles } = get();
    return movedFiles[fileId] === targetFolderId;
  },

  // Temporary items actions
  addTemporaryItem: (item) =>
    set((state) => ({
      temporaryItems: {
        ...state.temporaryItems,
        [item._id]: item,
      },
    })),

  removeTemporaryItem: (itemId) =>
    set((state) => {
      const { [itemId]: _, ...remainingItems } = state.temporaryItems;
      return { temporaryItems: remainingItems };
    }),

  getTemporaryItems: (parentFolderId) => {
    const { temporaryItems } = get();
    return Object.values(temporaryItems).filter(
      (item) => item.parentFolderId === parentFolderId
    );
  },
}));
