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

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

const customOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

if (env.FRONTEND_URL) {
  customOrigins.push(env.FRONTEND_URL.trim());
}

const allowedOrigins = [...defaultAllowedOrigins, ...customOrigins];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server webhooks from GitHub/Clerk)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel preview and production deployments (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // In development mode, allow any local origin
      if (env.NODE_ENV === "development") {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-GitHub-Event",
      "X-GitHub-Delivery",
      "X-Hub-Signature-256",
      "svix-id",
      "svix-timestamp",
      "svix-signature",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // Cache preflight response for 24h
  }),
);
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
