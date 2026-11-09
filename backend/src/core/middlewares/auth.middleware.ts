import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/db.js";
import ApiError from "../../shared/utils/ApiError.js";
import { logger } from "../config/logger.js";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new ApiError(401, "Authentication required. Please provide a valid session token.");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: auth.userId },
  });

  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(auth.userId);

      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
      const username =
        clerkUser.username ??
        clerkUser.firstName ??
        (email ? email.split("@")[0] : null) ??
        `user_${auth.userId.slice(-6)}`;
      const avatarUrl = clerkUser.imageUrl ?? null;

      // Extract GitHub ID if authenticated via GitHub OAuth in Clerk
      const githubAccount = clerkUser.externalAccounts?.find(
        (acc) =>
          acc.provider === "oauth_github" ||
          acc.provider === "github" ||
          (acc as { verification?: { strategy?: string } }).verification?.strategy === "oauth_github",
      );
      const githubId = githubAccount?.externalId ? BigInt(githubAccount.externalId) : null;

      user = await prisma.user.upsert({
        where: { clerkId: auth.userId },
        create: {
          clerkId: auth.userId,
          username,
          email,
          avatarUrl,
          githubId,
        },
        update: {
          username,
          email,
          avatarUrl,
          ...(githubId ? { githubId } : {}),
        },
      });

      logger.info(`Auto-provisioned user ${user.id} (${username}) from Clerk session on the fly`);
    } catch (err) {
      logger.error("Failed to auto-provision user from Clerk:", err);
      throw new ApiError(404, "User record not found in the local database.");
    }
  }

  req.user = user;
  next();
};