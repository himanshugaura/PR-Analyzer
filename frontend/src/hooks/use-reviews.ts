import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import type {
  Finding,
  FindingCategory,
  FindingStatus,
  Review,
  ReviewMetrics,
  Severity,
} from "../types";

export interface GetReviewResponse {
  review: Review;
  metrics: ReviewMetrics;
}

export interface ReviewFilterOptions {
  severity?: Severity;
  category?: FindingCategory;
  status?: FindingStatus;
  filePath?: string;
}

export function useReview(id?: string, filter?: ReviewFilterOptions) {
  return useQuery({
    queryKey: ["review", id, filter],
    queryFn: () =>
      apiClient<GetReviewResponse>(`/reviews/${id}`, {
        params: {
          severity: filter?.severity,
          category: filter?.category,
          status: filter?.status,
          filePath: filter?.filePath,
        },
      }),
    enabled: Boolean(id),
  });
}

export function useTriggerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pullRequestId,
      forceReReview = false,
    }: {
      pullRequestId: string;
      forceReReview?: boolean;
    }) =>
      apiClient<Review>(`/reviews/pull-request/${pullRequestId}`, {
        method: "POST",
        body: JSON.stringify({ forceReReview }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pull-request", variables.pullRequestId] });
      queryClient.invalidateQueries({ queryKey: ["review", data?.id] });
    },
  });
}

export function useUpdateFindingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      findingId,
      status,
    }: {
      findingId: string;
      status: FindingStatus;
    }) =>
      apiClient<Finding>(`/reviews/findings/${findingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
  });
}

export function usePostReviewComments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      apiClient<{ posted: boolean; reviewCommentCount: number }>(
        `/reviews/${reviewId}/post-comments`,
        { method: "POST" },
      ),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
    },
  });
}
