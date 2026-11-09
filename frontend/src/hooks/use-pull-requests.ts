import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "../lib/api-client";
import type { PullRequest, PullRequestDiffData, PullRequestState } from "../types";

export interface ListPullRequestsOptions {
  state?: PullRequestState | "ALL";
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListPullRequestsResponse {
  pullRequests: PullRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useRepositoryPullRequests(
  repositoryId: string,
  options: ListPullRequestsOptions = {},
) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["pull-requests", repositoryId, options],
    queryFn: () =>
      apiClient<ListPullRequestsResponse>(`/pull-requests/repository/${repositoryId}`, {
        params: {
          state: options.state,
          page: options.page,
          limit: options.limit,
          search: options.search,
        },
      }),
    enabled: Boolean(isSignedIn && repositoryId),
  });
}

export function usePullRequest(id: string) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["pull-request", id],
    queryFn: () => apiClient<PullRequest>(`/pull-requests/${id}`),
    enabled: Boolean(isSignedIn && id),
  });
}

export function usePullRequestDiff(id: string) {
  const { isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["pull-request-diff", id],
    queryFn: () => apiClient<PullRequestDiffData>(`/pull-requests/${id}/diff`),
    enabled: Boolean(isSignedIn && id),
  });
}
