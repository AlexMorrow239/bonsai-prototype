import { create } from "zustand";

import { mockChatsListData } from "@/data";

// Types
interface Project {
  project_id: number;
  name: string;
  description: string;
  created_at: string;
  is_active: boolean;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  activeProjects: Project[];
  archivedProjects: Project[];

  // Actions
  setCurrentProject: (projectId: number) => void;
  createProject: (name: string, description: string) => void;
  updateProject: (projectId: number, updates: Partial<Project>) => void;
  archiveProject: (projectId: number) => void;
  unarchiveProject: (projectId: number) => void;
  deleteProject: (projectId: number) => void;

  // Helper functions
  getProjectById: (projectId: number) => Project | undefined;
  getActiveProjects: () => Project[];
  getArchivedProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: mockChatsListData.projects.map((project) => ({
    ...project,
    created_at: new Date().toISOString(),
    is_active: true,
  })),
  currentProject: null,
  activeProjects: mockChatsListData.projects.map((project) => ({
    ...project,
    created_at: new Date().toISOString(),
    is_active: true,
  })),
  archivedProjects: [],

  // Actions
  setCurrentProject: (projectId) => {
    const project = get().projects.find((p) => p.project_id === projectId);
    set({ currentProject: project || null });
  },

  createProject: (name, description) => {
    set((state) => {
      const newProjectId =
        Math.max(...state.projects.map((p) => p.project_id)) + 1;
      const newProject: Project = {
        project_id: newProjectId,
        name,
        description,
        created_at: new Date().toISOString(),
        is_active: true,
      };

      return {
        projects: [...state.projects, newProject],
        activeProjects: [...state.activeProjects, newProject],
        currentProject: newProject,
      };
    });
  },

  updateProject: (projectId, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.project_id === projectId ? { ...project, ...updates } : project
      ),
      activeProjects: state.activeProjects.map((project) =>
        project.project_id === projectId ? { ...project, ...updates } : project
      ),
      archivedProjects: state.archivedProjects.map((project) =>
        project.project_id === projectId ? { ...project, ...updates } : project
      ),
      currentProject:
        state.currentProject?.project_id === projectId
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    }));
  },

  archiveProject: (projectId) => {
    set((state) => {
      const projectToArchive = state.activeProjects.find(
        (p) => p.project_id === projectId
      );
      if (!projectToArchive) return state;

      const updatedProject = { ...projectToArchive, is_active: false };

      return {
        projects: state.projects.map((p) =>
          p.project_id === projectId ? updatedProject : p
        ),
        activeProjects: state.activeProjects.filter(
          (p) => p.project_id !== projectId
        ),
        archivedProjects: [...state.archivedProjects, updatedProject],
        currentProject:
          state.currentProject?.project_id === projectId
            ? null
            : state.currentProject,
      };
    });
  },

  unarchiveProject: (projectId) => {
    set((state) => {
      const projectToUnarchive = state.archivedProjects.find(
        (p) => p.project_id === projectId
      );
      if (!projectToUnarchive) return state;

      const updatedProject = { ...projectToUnarchive, is_active: true };

      return {
        projects: state.projects.map((p) =>
          p.project_id === projectId ? updatedProject : p
        ),
        archivedProjects: state.archivedProjects.filter(
          (p) => p.project_id !== projectId
        ),
        activeProjects: [...state.activeProjects, updatedProject],
      };
    });
  },

  deleteProject: (projectId) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.project_id !== projectId),
      activeProjects: state.activeProjects.filter(
        (p) => p.project_id !== projectId
      ),
      archivedProjects: state.archivedProjects.filter(
        (p) => p.project_id !== projectId
      ),
      currentProject:
        state.currentProject?.project_id === projectId
          ? null
          : state.currentProject,
    }));
  },

  // Helper functions
  getProjectById: (projectId) => {
    return get().projects.find((p) => p.project_id === projectId);
  },

  getActiveProjects: () => {
    return get().activeProjects;
  },

  getArchivedProjects: () => {
    return get().archivedProjects;
  },
}));
