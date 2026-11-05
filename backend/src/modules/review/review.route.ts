import { Router } from "express";

import { authMiddleware } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middlewares/validateRequest.middleware.js";
import {
  getReview,
  triggerReview,
  updateFindingStatus,
} from "./review.controller.js";
import {
  findingIdParamSchema,
  listFindingsQuerySchema,
  pullRequestIdParamSchema,
  reviewIdParamSchema,
  triggerReviewBodySchema,
  updateFindingStatusSchema,
} from "./review.validation.js";

const router = Router();

// Protect all review routes with Clerk authentication
router.use(authMiddleware);

// Trigger a review manually for a pull request
router.post(
  "/pull-request/:pullRequestId",
  validateParams(pullRequestIdParamSchema),
  validateBody(triggerReviewBodySchema),
  triggerReview,
);

// Get review details, metrics, and findings
router.get(
  "/:id",
  validateParams(reviewIdParamSchema),
  validateQuery(listFindingsQuerySchema),
  getReview,
);

// Update status of an individual finding (e.g. resolve or dismiss)
router.patch(
  "/findings/:findingId/status",
  validateParams(findingIdParamSchema),
  validateBody(updateFindingStatusSchema),
  updateFindingStatus,
);

export default router;
