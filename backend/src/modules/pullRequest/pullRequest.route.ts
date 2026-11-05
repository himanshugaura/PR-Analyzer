import { Router } from "express";

import { authMiddleware } from "../../core/middlewares/auth.middleware.js";
import {
  validateParams,
  validateQuery,
} from "../../core/middlewares/validateRequest.middleware.js";
import {
  getPullRequest,
  getPullRequestDiff,
  listPullRequests,
} from "./pullRequest.controller.js";
import {
  listPullRequestsQuerySchema,
  pullRequestIdParamSchema,
  repositoryPullRequestsParamsSchema,
} from "./pullRequest.validation.js";

const router = Router();

// Protect all PR routes with Clerk authentication
router.use(authMiddleware);

// List pull requests for a specific repository
router.get(
  "/repository/:repositoryId",
  validateParams(repositoryPullRequestsParamsSchema),
  validateQuery(listPullRequestsQuerySchema),
  listPullRequests,
);

// Get pull request diff & modified files from GitHub
router.get(
  "/:id/diff",
  validateParams(pullRequestIdParamSchema),
  getPullRequestDiff,
);

// Get single pull request details from database
router.get(
  "/:id",
  validateParams(pullRequestIdParamSchema),
  getPullRequest,
);

export default router;
