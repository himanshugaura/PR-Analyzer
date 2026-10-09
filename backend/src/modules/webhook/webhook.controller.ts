import type { Request, Response } from "express";
import {
  verifyClerkWebhook,
  processClerkWebhookEvent,
} from "./webhook.service.js";
import sendResponse from "../../shared/utils/ApiResponse.js";


export const handleClerkWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const event = verifyClerkWebhook(req);
  await processClerkWebhookEvent(event);

  sendResponse(res, 200, "Webhook processed successfully", {
    received: true,
    eventType: event.type,
  });
};

export { handleGitHubWebhook } from "../installation/installation.controller.js";

