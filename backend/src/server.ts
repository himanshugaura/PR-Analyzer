import type { Server } from "node:http";
import app from "./app.js";
import { connectDB, disconnectDB } from "./core/config/db.js";
import { env } from "./core/config/env.js";
import { logger } from "./core/config/logger.js";

// Enable automatic BigInt serialization to string for JSON.stringify / res.json
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (): string {
  return this.toString();
};

let server: Server;

const startServer = async (): Promise<void> => {
  await connectDB();

  server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");
      await disconnectDB();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forceful shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Rejection detected", { reason });
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception detected", { error });
  process.exit(1);
});

startServer().catch((error: unknown) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
