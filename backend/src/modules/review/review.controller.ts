import type { Request, Response } from "express";

import * as reviewService from "./review.service.js";
import type {
  ListFindingsQueryInput,
  TriggerReviewBodyInput,
  UpdateFindingStatusInput,
} from "./review.validation.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ApiError from "../../shared/utils/ApiError.js";
import { FindingStatus } from "../../generated/prisma/enums.js";

/**
 * Controller to manually trigger or re-run an AI review on a pull request.
 */
export const triggerReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const pullRequestId = req.params.pullRequestId as string;
  const body = req.body as TriggerReviewBodyInput;

  const review = await reviewService.runPullRequestReview({
    pullRequestId,
    triggeredById: req.user.id,
    forceReReview: body?.forceReReview ?? false,
  });

  sendResponse(
    res,
    review ? 200 : 202,
    review
      ? "AI Review completed successfully"
      : "AI Review was skipped due to repository settings",
    review,
  );
};

/**
 * Controller to fetch review details, findings, and severity metrics.
 */
export const getReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reviewId = req.params.id as string;
  const query = req.query as unknown as ListFindingsQueryInput;

  const result = await reviewService.getReviewById(
    reviewId,
    req.user.id,
    query,
  );

  sendResponse(res, 200, "Review retrieved successfully", result);
};

/**
 * Controller to update the resolution status of a finding.
 */
export const updateFindingStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const findingId = req.params.findingId as string;
  const body = req.body as UpdateFindingStatusInput;

  const updatedFinding = await reviewService.updateFindingStatus(
    findingId,
    req.user.id,
    body.status as FindingStatus,
  );

  sendResponse(res, 200, "Finding status updated successfully", updatedFinding);
};

/**
 * Controller to manually post review comments to GitHub PR.
 */
export const postReviewComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const reviewId = req.params.id as string;
  const result = await reviewService.postReviewToGitHub(reviewId);

  sendResponse(
    res,
    200,
    result.posted
      ? "Review comments posted to GitHub successfully"
      : `Review comment posting skipped: ${result.skippedReason}`,
    result,
  );
};

