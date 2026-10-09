import { Router } from "express";
import express, { type Request, type Response } from "express";
import { handleClerkWebhook } from "./webhook.controller.js";

const router = Router();


const clerkWebhookParser = express.json({
  limit: "1mb",
  verify: (req: Request, _res: Response, buf: Buffer) => {
    req.rawBody = buf.toString("utf8");
  },
});

router.post("/clerk", clerkWebhookParser, handleClerkWebhook);

export default router;
