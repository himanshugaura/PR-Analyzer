import type { Request, Response } from "express";
import { z } from "zod";

import * as installationService from "./installation.service.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ApiError from "../../shared/utils/ApiError.js";

export const linkInstallationSchema = z.object({
  installationId: z.union([z.number(), z.string()]).transform((val) => {
    try {
      return BigInt(val);
    } catch {
      throw new Error("Invalid installationId format");
    }
  }),
});

export const updateRepositorySettingsSchema = z.object({
  enabled: z.boolean().optional(),
  minimumSeverity: z
    .enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"])
    .optional(),
  aiReviewEnabled: z.boolean().optional(),
  staticAnalysisEnabled: z.boolean().optional(),
  autoComment: z.boolean().optional(),
});

export const installationIdParamSchema = z.object({
  id: z.string().min(1, "Installation ID is required"),
});

export const repositoryIdParamSchema = z.object({
  repositoryId: z.string().min(1, "Repository ID is required"),
});


export const handleGitHubWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await installationService.processGitHubWebhook(req);

  sendResponse(res, 200, "GitHub webhook processed successfully", {
    received: true,
    eventType: result.event,
    action: result.action,
    duplicate: result.duplicate ?? false,
  });
};

export const listUserInstallations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const installations = await installationService.getUserInstallations(req.user.id);

  sendResponse(res, 200, "User installations retrieved successfully", installations);
};

/**
 * Gets a specific GitHub installation by ID for the authenticated user.
 */
export const getInstallation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const id = req.params.id as string;
  const installation = await installationService.getInstallationById(
    id,
    req.user.id,
  );

  sendResponse(res, 200, "Installation retrieved successfully", installation);
};

/**
 * Links an installation to the currently authenticated user.
 */
export const linkInstallation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const installation = await installationService.linkInstallationToUser(
    req.body.installationId as bigint,
    req.user.id,
  );

  sendResponse(res, 200, "Installation linked successfully", installation);
};


export const updateRepository = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const repositoryId = req.params.repositoryId as string;
  const result = await installationService.updateRepositorySettings(
    repositoryId,
    req.user.id,
    req.body,
  );

  sendResponse(res, 200, "Repository settings updated successfully", result);
};
