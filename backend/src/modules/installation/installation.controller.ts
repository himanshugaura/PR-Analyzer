import type { Request, Response } from "express";

import * as installationService from "./installation.service.js";
import type { ListInstallationsQueryInput } from "./installation.validation.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ApiError from "../../shared/utils/ApiError.js";


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

  const query = req.query as unknown as ListInstallationsQueryInput;
  const installations = await installationService.getUserInstallations(
    req.user.id,
    query,
  );

  sendResponse(res, 200, "User installations retrieved successfully", installations);
};


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
