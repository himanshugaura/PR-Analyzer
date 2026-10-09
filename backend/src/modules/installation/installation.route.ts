import { Router } from "express";

import { authMiddleware } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validateRequest.middleware.js";
import {
  getInstallation,
  installationIdParamSchema,
  linkInstallation,
  linkInstallationSchema,
  listUserInstallations,
  repositoryIdParamSchema,
  updateRepository,
  updateRepositorySettingsSchema,
} from "./installation.controller.js";

const router = Router();

// Protect all installation routes with Clerk authentication middleware
router.use(authMiddleware);

// List all installations linked to the current user
router.get("/", listUserInstallations);

// Link an installation to the current user
router.post("/link", validateBody(linkInstallationSchema), linkInstallation);

// Get specific installation details and repositories
router.get("/:id", validateParams(installationIdParamSchema), getInstallation);

// Update repository settings / toggle repository
router.patch(
  "/repositories/:repositoryId/settings",
  validateParams(repositoryIdParamSchema),
  validateBody(updateRepositorySettingsSchema),
  updateRepository,
);

export default router;
