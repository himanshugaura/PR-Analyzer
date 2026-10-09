import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";

import { env } from "./core/config/env.js";
import { errorMiddleware } from "./core/middlewares/error.middleware.js";
import { notFoundMiddleware } from "./core/middlewares/notFound.middleware.js";
import { requestLogger } from "./core/middlewares/requestLogger.js";

import apiRoutes from "./modules/index.routes.js";
import webhookRoutes from "./modules/webhook/webhook.route.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestLogger);

app.use("/webhooks", webhookRoutes);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    env: env.NODE_ENV,
  });
});

app.use("/api/v1", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
