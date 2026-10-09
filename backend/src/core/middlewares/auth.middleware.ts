import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/db.js";
import ApiError from "../../shared/utils/ApiError.js";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);

  if (!auth.userId) {
    throw new ApiError(401, "Authentication required. Please provide a valid session token.");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: auth.userId },
  });

  if (!user) {
    throw new ApiError(404, "User record not found in the local database.");
  }

  req.user = user;
  next();
};