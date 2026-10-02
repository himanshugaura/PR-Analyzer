import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Connected to the database successfully");
  } catch (error) {
    logger.error("Error connecting to the database", { error });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("Disconnected from the database");
  } catch (error) {
    logger.error("Error disconnecting from the database", { error });
  }
};