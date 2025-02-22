import { create } from "zustand";

import type { Project } from "@/types";

interface ProjectState {
  // State
  projects: Project[] | null;
  currentProject: Project | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  // Initial state
  projects: [],
  currentProject: null,

  // Actions
  setProjects: (projects) => {
    set({ projects });
  },

  setCurrentProject: (project) => set({ currentProject: project }),
  clearCurrentProject: () => set({ currentProject: null }),
}));
