import { Router } from "express";
import express, { type Request, type Response } from "express";
import {
  handleClerkWebhook,
  handleGitHubWebhook,
} from "./webhook.controller.js";

const router = Router();

const webhookRawBodyParser = express.json({
  limit: "5mb",
  verify: (req: Request, _res: Response, buf: Buffer) => {
    req.rawBody = buf.toString("utf8");
  },
});

router.post("/clerk", webhookRawBodyParser, handleClerkWebhook);
router.post("/github", webhookRawBodyParser, handleGitHubWebhook);

export default router;
