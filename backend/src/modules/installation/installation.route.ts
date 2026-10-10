import { Router } from "express";

import { authMiddleware } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middlewares/validateRequest.middleware.js";
import {
  getInstallation,
  linkInstallation,
  listUserInstallations,
  updateRepository,
} from "./installation.controller.js";
import {
  installationIdParamSchema,
  linkInstallationSchema,
  listInstallationsQuerySchema,
  repositoryIdParamSchema,
  updateRepositorySettingsSchema,
} from "./installation.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listInstallationsQuerySchema), listUserInstallations);

router.post("/link", validateBody(linkInstallationSchema), linkInstallation);

router.get("/:id", validateParams(installationIdParamSchema), getInstallation);

router.patch(
  "/repositories/:repositoryId/settings",
  validateParams(repositoryIdParamSchema),
  validateBody(updateRepositorySettingsSchema),
  updateRepository,
);

export default router;
