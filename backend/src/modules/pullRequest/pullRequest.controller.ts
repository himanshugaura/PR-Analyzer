import type { Request, Response } from "express";

import * as pullRequestService from "./pullRequest.service.js";
import type { ListPullRequestsQueryInput } from "./pullRequest.validation.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ApiError from "../../shared/utils/ApiError.js";

/**
 * Controller to list pull requests for a given repository.
 */
export const listPullRequests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const repositoryId = req.params.repositoryId as string;
  const query = req.query as unknown as ListPullRequestsQueryInput;

  const result = await pullRequestService.listPullRequestsByRepository(
    repositoryId,
    req.user.id,
    query,
  );

  sendResponse(res, 200, "Pull requests retrieved successfully", result);
};

/**
 * Controller to retrieve single pull request details.
 */
export const getPullRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const id = req.params.id as string;
  const pr = await pullRequestService.getPullRequestById(id, req.user.id);

  sendResponse(res, 200, "Pull request retrieved successfully", pr);
};

/**
 * Controller to fetch the git diff and changed files for a pull request.
 */
export const getPullRequestDiff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const id = req.params.id as string;
  const diffData = await pullRequestService.getPullRequestDiffData(id, req.user.id);

  sendResponse(res, 200, "Pull request diff retrieved successfully", diffData);
};
