import { useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosError } from "axios";

import { apiClient } from "@/lib/api-client";
import type { ApiError, ApiResponse, Project } from "@/types/api";

export function useProjects() {
  return useQuery<Project[], AxiosError<ApiError>>({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Project[]>>(`/projects`);
      return data.data;
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
  is_active?: boolean;
}

export function useCreateProject() {
  return useMutation<Project, AxiosError<ApiError>, CreateProjectData>({
    mutationFn: async (projectData) => {
      const { data } = await apiClient.post<ApiResponse<Project>>(
        "/projects",
        projectData
      );
      return data.data;
    },
  });
}

export function useUpdateProject() {
  return useMutation<Project, AxiosError<ApiError>, UpdateProjectData>({
    mutationFn: async ({ _id, ...projectData }) => {
      const { data } = await apiClient.patch<ApiResponse<Project>>(
        `/projects/${_id}`,
        projectData
      );
      return data.data;
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
