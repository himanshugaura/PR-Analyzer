import { Webhook, WebhookVerificationError } from "svix";
import type { Request } from "express";

import { env } from "../../core/config/env.js";
import { logger } from "../../core/config/logger.js";
import { prisma } from "../../core/config/db.js";
import ApiError from "../../shared/utils/ApiError.js";
import type {
  ClerkUserData,
  ClerkUserDeletedData,
  ClerkWebhookEvent,
  ExtractedUserData,
} from "../../shared/types/webhook.types.js";


const extractUserData = (data: ClerkUserData): ExtractedUserData => {
  const clerkId = data.id;

  const primaryEmail =
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
      ?.email_address ||
    data.email_addresses?.[0]?.email_address ||
    null;

  let username = data.username?.trim();
  if (!username) {
    if (data.first_name) {
      username = `${data.first_name}${data.last_name ? ` ${data.last_name}` : ""}`.trim();
    } else if (primaryEmail) {
      username = primaryEmail.split("@")[0];
    } else {
      username = `user_${clerkId.slice(-8)}`;
    }
  }

  const avatarUrl = data.image_url || data.profile_image_url || null;

  return {
    clerkId,
    username,
    email: primaryEmail,
    avatarUrl,
  };
};

export const verifyClerkWebhook = (req: Request): ClerkWebhookEvent => {
  const secret = env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("CLERK_WEBHOOK_SECRET is not configured in environment variables");
    throw new ApiError(500, "CLERK_WEBHOOK_SECRET is not configured on the server");
  }

  const svixId = req.headers["svix-id"] as string | undefined;
  const svixTimestamp = req.headers["svix-timestamp"] as string | undefined;
  const svixSignature = req.headers["svix-signature"] as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new ApiError(400, "Missing required Svix headers (svix-id, svix-timestamp, svix-signature)");
  }

  const payload = req.rawBody;
  if (!payload) {
    throw new ApiError(400, "Missing raw request body for webhook verification");
  }

  try {
    const wh = new Webhook(secret);
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      logger.warn("Clerk webhook verification failed", { error: error.message });
      throw new ApiError(400, `Invalid webhook signature: ${error.message}`);
    }

    logger.error("Unexpected error during Clerk webhook verification", { error });
    throw new ApiError(400, "Invalid webhook signature");
  }

  try {
    return (typeof req.body === "object" && req.body !== null
      ? req.body
      : JSON.parse(payload)) as ClerkWebhookEvent;
  } catch {
    throw new ApiError(400, "Invalid JSON payload in webhook body");
  }
};


const handleUserCreated = async (data: ClerkUserData): Promise<void> => {
  const userData = extractUserData(data);

  await prisma.user.upsert({
    where: { clerkId: userData.clerkId },
    create: {
      clerkId: userData.clerkId,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
    },
    update: {
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
    },
  });

  logger.info(`User created/upserted from Clerk webhook with clerkId: ${userData.clerkId}`);
};

const handleUserUpdated = async (data: ClerkUserData): Promise<void> => {
  const userData = extractUserData(data);

  await prisma.user.upsert({
    where: { clerkId: userData.clerkId },
    update: {
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
    },
    create: {
      clerkId: userData.clerkId,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
    },
  });

  logger.info(`User updated from Clerk webhook with clerkId: ${userData.clerkId}`);
};

const handleUserDeleted = async (data: ClerkUserDeletedData): Promise<void> => {
  const clerkId = data.id;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!existingUser) {
    logger.info(`Clerk user.deleted received, but user with clerkId ${clerkId} was not found or already deleted`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.gitHubInstallation.updateMany({
      where: { userId: existingUser.id },
      data: { userId: null },
    });

    await tx.review.updateMany({
      where: { triggeredById: existingUser.id },
      data: { triggeredById: null },
    });

    await tx.user.delete({
      where: { id: existingUser.id },
    });
  });

  logger.info(`User with clerkId: ${clerkId} safely deleted from local database`);
};

export const processClerkWebhookEvent = async (event: ClerkWebhookEvent): Promise<void> => {
  switch (event.type) {
    case "user.created":
      await handleUserCreated(event.data as ClerkUserData);
      break;

    case "user.updated":
      await handleUserUpdated(event.data as ClerkUserData);
      break;

    case "user.deleted":
      await handleUserDeleted(event.data as ClerkUserDeletedData);
      break;

    default:
      logger.info(`Unhandled Clerk webhook event type: ${event.type}`);
      break;
  }
};
