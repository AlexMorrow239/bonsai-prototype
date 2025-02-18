import { create } from "zustand";

import { mockChatsListData } from "@/data";
import type { Project, ProjectListItem } from "@/types";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  activeProjects: ProjectListItem[];
  archivedProjects: ProjectListItem[];

  // Actions
  setCurrentProject: (projectId: number) => void;
  createProject: (name: string, description: string) => void;
  updateProject: (projectId: number, updates: Partial<Project>) => void;
  archiveProject: (projectId: number) => void;
  unarchiveProject: (projectId: number) => void;
  deleteProject: (projectId: number) => void;

  // Helper functions
  getProjectById: (projectId: number) => Project | undefined;
  getActiveProjects: () => ProjectListItem[];
  getArchivedProjects: () => ProjectListItem[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: mockChatsListData.projects.map((project) => ({
    project_id: project.project_id,
    name: project.name,
    description: project.description,
    created_at: new Date().toISOString(),
    last_accessed: new Date().toISOString(),
  })),
  currentProject: null,
  activeProjects: mockChatsListData.projects.map((project) => ({
    project_id: project.project_id,
    name: project.name,
    description: project.description,
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
      const now = new Date().toISOString();

      const newProject: Project = {
        project_id: newProjectId,
        name,
        description,
        created_at: now,
        last_accessed: now,
      };

      const newProjectListItem: ProjectListItem = {
        project_id: newProjectId,
        name,
        description,
        created_at: now,
        is_active: true,
      };

      return {
        projects: [...state.projects, newProject],
        activeProjects: [...state.activeProjects, newProjectListItem],
        currentProject: newProject,
      };
    });
  },

  updateProject: (projectId, updates) => {
    set((state) => {
      const updatedProjects = state.projects.map((project) =>
        project.project_id === projectId ? { ...project, ...updates } : project
      );

      // Find the existing project to ensure we have all required fields
      const existingProject = state.projects.find(
        (p) => p.project_id === projectId
      );
      if (!existingProject) return state;

      const updatedListItem: ProjectListItem = {
        project_id: projectId,
        name: updates.name ?? existingProject.name,
        description: updates.description ?? existingProject.description,
        created_at: updates.created_at ?? existingProject.created_at,
        is_active: true,
      };

      return {
        projects: updatedProjects,
        activeProjects: state.activeProjects.map((project) =>
          project.project_id === projectId ? updatedListItem : project
        ),
        archivedProjects: state.archivedProjects.map((project) =>
          project.project_id === projectId ? updatedListItem : project
        ),
        currentProject:
          state.currentProject?.project_id === projectId
            ? { ...state.currentProject, ...updates }
            : state.currentProject,
      };
    });
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
          p.project_id === projectId
            ? { ...p, last_accessed: new Date().toISOString() }
            : p
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
          p.project_id === projectId
            ? { ...p, last_accessed: new Date().toISOString() }
            : p
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
