import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type {
  ApiError,
  ApiResponse,
  Project,
  ProjectListResponse,
  ProjectResponse,
} from "@/types";

export function useProjects() {
  return useQuery<Project[], AxiosError<ApiError>>({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      const response =
        await apiClient.get<ApiResponse<ProjectListResponse>>(`/projects`);
      return response.data.data.data;
    },
  });
}

interface CreateProjectData {
  name: string;
  description: string;
}

interface UpdateProjectData {
  _id: string;
  name?: string;
  description?: string;
}

export function useCreateProject() {
  return useMutation<Project, AxiosError<ApiError>, CreateProjectData>({
    mutationFn: async (projectData) => {
      const response = await apiClient.post<ApiResponse<ProjectResponse>>(
        "/projects",
        projectData
      );
      return response.data.data.data;
    },
  });
}

export function useUpdateProject() {
  return useMutation<Project, AxiosError<ApiError>, UpdateProjectData>({
    mutationFn: async ({ _id, ...projectData }) => {
      const response = await apiClient.patch<ApiResponse<ProjectResponse>>(
        `/projects/${_id}`,
        projectData
      );
      return response.data.data.data;
    },
  });
}

export function useDeleteProject() {
  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (_id) => {
      await apiClient.delete(`/projects/${_id}`);
    },
  });
}

export function useGetProject(projectId: string) {
  return useQuery<Project, AxiosError<ApiError>>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProjectResponse>>(
        `/projects/${projectId}`
      );
      return response.data.data.data;
    },
    enabled: !!projectId,
  });
}
