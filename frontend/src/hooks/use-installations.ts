import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "../lib/api-client";
import type { GitHubInstallation, RepositorySettings, Severity } from "../types";

export function useInstallations(search?: string) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["installations", { search }],
    queryFn: () =>
      apiClient<GitHubInstallation[]>("/installations", {
        params: search ? { search } : undefined,
      }),
    enabled: Boolean(isSignedIn),
  });
}

export function useInstallation(id: string) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["installation", id],
    queryFn: () => apiClient<GitHubInstallation>(`/installations/${id}`),
    enabled: Boolean(isSignedIn && id),
  });
}

export function useLinkInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installationId: string | number) =>
      apiClient<GitHubInstallation>("/installations/link", {
        method: "POST",
        body: JSON.stringify({ installationId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installations"] });
    },
  });
}

export interface UpdateRepoSettingsPayload {
  repositoryId: string;
  enabled?: boolean;
  minimumSeverity?: Severity;
  aiReviewEnabled?: boolean;
  staticAnalysisEnabled?: boolean;
  autoComment?: boolean;
}

export function useUpdateRepositorySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repositoryId, ...settings }: UpdateRepoSettingsPayload) =>
      apiClient<{ repositoryId: string; enabled: boolean; settings: RepositorySettings }>(
        `/installations/repositories/${repositoryId}/settings`,
        {
          method: "PATCH",
          body: JSON.stringify(settings),
        },
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["installations"] });
      queryClient.invalidateQueries({ queryKey: ["installation"] });
      queryClient.invalidateQueries({ queryKey: ["pull-requests", variables.repositoryId] });
    },
  });
}
