import { z } from "zod";

export const reviewIdParamSchema = z.object({
  id: z.string().trim().min(1, "Review ID is required"),
});

export const pullRequestIdParamSchema = z.object({
  pullRequestId: z.string().trim().min(1, "Pull Request ID is required"),
});

export const findingIdParamSchema = z.object({
  findingId: z.string().trim().min(1, "Finding ID is required"),
});

export const triggerReviewBodySchema = z.object({
  forceReReview: z.boolean().optional(),
});

export const listFindingsQuerySchema = z.object({
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]).optional(),
  category: z
    .enum([
      "BUG",
      "SECURITY",
      "PERFORMANCE",
      "CODE_QUALITY",
      "STYLE",
      "MAINTAINABILITY",
      "ERROR_HANDLING",
      "TESTING",
      "DATABASE",
      "API",
      "OTHER",
    ])
    .optional(),
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]).optional(),
  filePath: z.string().trim().optional(),
});

export const updateFindingStatusSchema = z.object({
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]),
});

export type ReviewIdParamInput = z.infer<typeof reviewIdParamSchema>;
export type PullRequestIdParamInput = z.infer<typeof pullRequestIdParamSchema>;
export type TriggerReviewBodyInput = z.infer<typeof triggerReviewBodySchema>;
export type ListFindingsQueryInput = z.infer<typeof listFindingsQuerySchema>;
export type UpdateFindingStatusInput = z.infer<typeof updateFindingStatusSchema>;
