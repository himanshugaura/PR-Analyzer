import { z } from "zod";

export const pullRequestIdParamSchema = z.object({
  id: z.string().trim().min(1, "Pull Request ID is required"),
});

export const repositoryPullRequestsParamsSchema = z.object({
  repositoryId: z.string().trim().min(1, "Repository ID is required"),
});

export const listPullRequestsQuerySchema = z.object({
  state: z.enum(["OPEN", "CLOSED", "MERGED", "ALL"]).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  search: z.string().trim().optional(),
});

export type PullRequestIdParamInput = z.infer<typeof pullRequestIdParamSchema>;
export type RepositoryPullRequestsParamsInput = z.infer<
  typeof repositoryPullRequestsParamsSchema
>;
export type ListPullRequestsQueryInput = z.infer<
  typeof listPullRequestsQuerySchema
>;
