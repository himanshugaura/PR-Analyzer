import crypto from "node:crypto";
import type { Request } from "express";

import { env } from "../../core/config/env.js";
import { logger } from "../../core/config/logger.js";
import { prisma } from "../../core/config/db.js";
import ApiError from "../../shared/utils/ApiError.js";
import {
  GitHubAccountType,
  PullRequestState,
  Severity,
} from "../../generated/prisma/enums.js";
import type {
  GitHubInstallationPayload,
  GitHubInstallationRepositoriesPayload,
  GitHubPullRequestPayload,
  UpdateRepositorySettingsDto,
} from "../../shared/types/github.types.js";

export const verifyGitHubSignature = (
  rawBody: string | undefined,
  signatureHeader: string | undefined,
  secret: string,
): boolean => {
  if (!rawBody || !signatureHeader) {
    return false;
  }

  if (!signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const signature = signatureHeader.slice(7);
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const digestBuffer = Buffer.from(digest, "hex");

    if (signatureBuffer.length !== digestBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
  } catch {
    return false;
  }
};

export const verifyAndExtractGitHubWebhook = (
  req: Request,
): { event: string; deliveryId: string; payload: Record<string, unknown> } => {
  const secret = env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("GITHUB_WEBHOOK_SECRET is not configured in environment variables");
    throw new ApiError(500, "GITHUB_WEBHOOK_SECRET is not configured on the server");
  }

  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const event = req.headers["x-github-event"] as string | undefined;
  const deliveryId = req.headers["x-github-delivery"] as string | undefined;

  if (!signature) {
    throw new ApiError(400, "Missing X-Hub-Signature-256 header");
  }

  if (!event) {
    throw new ApiError(400, "Missing X-GitHub-Event header");
  }

  if (!deliveryId) {
    throw new ApiError(400, "Missing X-GitHub-Delivery header");
  }

  const rawBody = req.rawBody;
  if (!rawBody) {
    throw new ApiError(400, "Missing raw request body for webhook verification");
  }

  const isValid = verifyGitHubSignature(rawBody, signature, secret);
  if (!isValid) {
    logger.warn("GitHub webhook signature verification failed", { deliveryId, event });
    throw new ApiError(401, "Invalid GitHub webhook signature");
  }

  let payload: Record<string, unknown>;
  try {
    payload = (typeof req.body === "object" && req.body !== null
      ? req.body
      : JSON.parse(rawBody)) as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Invalid JSON payload in webhook body");
  }

  return { event, deliveryId, payload };
};

export const handleInstallationEvent = async (
  payload: GitHubInstallationPayload,
): Promise<void> => {
  const action = payload.action;
  const installationId = BigInt(payload.installation.id);

  switch (action) {
    case "created": {
      const accountId = BigInt(payload.installation.account.id);
      const accountType =
        payload.installation.account.type?.toUpperCase() === "ORGANIZATION"
          ? GitHubAccountType.ORGANIZATION
          : GitHubAccountType.USER;

      const senderId = payload.sender?.id ? BigInt(payload.sender.id) : null;
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { githubId: accountId },
            ...(senderId ? [{ githubId: senderId }] : []),
          ],
        },
      });

      const installation = await prisma.gitHubInstallation.upsert({
        where: { installationId },
        create: {
          installationId,
          accountId,
          accountType,
          userId: user?.id ?? null,
          suspendedAt: payload.installation.suspended_at
            ? new Date(payload.installation.suspended_at)
            : null,
        },
        update: {
          accountId,
          accountType,
          suspendedAt: payload.installation.suspended_at
            ? new Date(payload.installation.suspended_at)
            : null,
          ...(user?.id ? { userId: user.id } : {}),
        },
      });

      if (payload.repositories && payload.repositories.length > 0) {
        for (const repo of payload.repositories) {
          const repoGithubId = BigInt(repo.id);
          const ownerLogin =
            repo.full_name?.split("/")[0] || payload.installation.account.login;

          await prisma.repository.upsert({
            where: { githubId: repoGithubId },
            create: {
              githubId: repoGithubId,
              name: repo.name,
              fullName: repo.full_name,
              ownerLogin,
              private: repo.private ?? false,
              defaultBranch: repo.default_branch ?? null,
              installationId: installation.id,
              enabled: true,
              settings: {
                create: {
                  enabled: true,
                  minimumSeverity: Severity.LOW,
                  aiReviewEnabled: true,
                  staticAnalysisEnabled: true,
                  autoComment: true,
                },
              },
            },
            update: {
              name: repo.name,
              fullName: repo.full_name,
              ownerLogin,
              private: repo.private ?? false,
              installationId: installation.id,
              ...(repo.default_branch ? { defaultBranch: repo.default_branch } : {}),
            },
          });
        }
      }

      logger.info(
        `GitHub installation created: ${installationId.toString()} (${payload.repositories?.length ?? 0} repos synced)`,
      );
      break;
    }

    case "deleted": {
      await prisma.gitHubInstallation.deleteMany({
        where: { installationId },
      });
      logger.info(`GitHub installation deleted: ${installationId.toString()}`);
      break;
    }

    case "suspend": {
      await prisma.gitHubInstallation.updateMany({
        where: { installationId },
        data: {
          suspendedAt: payload.installation.suspended_at
            ? new Date(payload.installation.suspended_at)
            : new Date(),
        },
      });
      logger.info(`GitHub installation suspended: ${installationId.toString()}`);
      break;
    }

    case "unsuspend": {
      await prisma.gitHubInstallation.updateMany({
        where: { installationId },
        data: {
          suspendedAt: null,
        },
      });
      logger.info(`GitHub installation unsuspended: ${installationId.toString()}`);
      break;
    }

    default:
      logger.info(`Unhandled installation action: ${action}`);
      break;
  }
};

export const handleInstallationRepositoriesEvent = async (
  payload: GitHubInstallationRepositoriesPayload,
): Promise<void> => {
  const action = payload.action;
  const installationId = BigInt(payload.installation.id);

  let dbInstallation = await prisma.gitHubInstallation.findUnique({
    where: { installationId },
  });

  if (!dbInstallation) {
    const accountId = BigInt(payload.installation.account.id);
    const accountType =
      payload.installation.account.type?.toUpperCase() === "ORGANIZATION"
        ? GitHubAccountType.ORGANIZATION
        : GitHubAccountType.USER;
    const senderId = payload.sender?.id ? BigInt(payload.sender.id) : null;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: accountId },
          ...(senderId ? [{ githubId: senderId }] : []),
        ],
      },
    });

    dbInstallation = await prisma.gitHubInstallation.upsert({
      where: { installationId },
      create: {
        installationId,
        accountId,
        accountType,
        userId: user?.id ?? null,
      },
      update: {},
    });
  }

  if (action === "added" && payload.repositories_added) {
    for (const repo of payload.repositories_added) {
      const repoGithubId = BigInt(repo.id);
      const ownerLogin =
        repo.full_name?.split("/")[0] || payload.installation.account.login;

      await prisma.repository.upsert({
        where: { githubId: repoGithubId },
        create: {
          githubId: repoGithubId,
          name: repo.name,
          fullName: repo.full_name,
          ownerLogin,
          private: repo.private ?? false,
          defaultBranch: repo.default_branch ?? null,
          installationId: dbInstallation.id,
          enabled: true,
          settings: {
            create: {
              enabled: true,
              minimumSeverity: Severity.LOW,
              aiReviewEnabled: true,
              staticAnalysisEnabled: true,
              autoComment: true,
            },
          },
        },
        update: {
          name: repo.name,
          fullName: repo.full_name,
          ownerLogin,
          private: repo.private ?? false,
          installationId: dbInstallation.id,
          ...(repo.default_branch ? { defaultBranch: repo.default_branch } : {}),
        },
      });
    }

    logger.info(
      `Added ${payload.repositories_added.length} repos to installation ${installationId.toString()}`,
    );
  } else if (action === "removed" && payload.repositories_removed) {
    for (const repo of payload.repositories_removed) {
      await prisma.repository.deleteMany({
        where: { githubId: BigInt(repo.id) },
      });
    }

    logger.info(
      `Removed ${payload.repositories_removed.length} repos from installation ${installationId.toString()}`,
    );
  }
};


export const handlePullRequestEvent = async (
  payload: GitHubPullRequestPayload,
): Promise<void> => {
  const pr = payload.pull_request;
  const repo = payload.repository;
  const repoGithubId = BigInt(repo.id);

  let repoRecord = await prisma.repository.findUnique({
    where: { githubId: repoGithubId },
  });

  if (!repoRecord) {
    if (payload.installation?.id) {
      const installationId = BigInt(payload.installation.id);
      let dbInstallation = await prisma.gitHubInstallation.findUnique({
        where: { installationId },
      });

      if (!dbInstallation) {
        dbInstallation = await prisma.gitHubInstallation.create({
          data: {
            installationId,
            accountId: repo.owner?.id ? BigInt(repo.owner.id) : installationId,
            accountType: GitHubAccountType.USER,
          },
        });
      }

      repoRecord = await prisma.repository.upsert({
        where: { githubId: repoGithubId },
        create: {
          githubId: repoGithubId,
          name: repo.name,
          fullName: repo.full_name,
          ownerLogin: repo.owner?.login || repo.full_name.split("/")[0],
          private: repo.private ?? false,
          defaultBranch: repo.default_branch ?? null,
          installationId: dbInstallation.id,
          enabled: true,
          settings: {
            create: {
              enabled: true,
              minimumSeverity: Severity.LOW,
              aiReviewEnabled: true,
              staticAnalysisEnabled: true,
              autoComment: true,
            },
          },
        },
        update: {
          name: repo.name,
          fullName: repo.full_name,
        },
      });
    } else {
      logger.warn(
        `Received pull_request for unknown repository ${repo.full_name} (${repo.id}) with no installation metadata`,
      );
      return;
    }
  }

  let state: PullRequestState = PullRequestState.OPEN;
  if (pr.merged || pr.merged_at) {
    state = PullRequestState.MERGED;
  } else if (pr.state === "closed") {
    state = PullRequestState.CLOSED;
  } else {
    state = PullRequestState.OPEN;
  }

  const prGithubId = BigInt(pr.id);
  const authorGithubId = pr.user?.id ? BigInt(pr.user.id) : null;
  const authorLogin = pr.user?.login ?? null;

  await prisma.pullRequest.upsert({
    where: { githubId: prGithubId },
    create: {
      githubId: prGithubId,
      number: pr.number,
      title: pr.title,
      body: pr.body ?? null,
      state,
      authorGithubId,
      authorLogin,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      baseSha: pr.base.sha,
      headSha: pr.head.sha,
      repositoryId: repoRecord.id,
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at),
      closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      syncedAt: new Date(),
    },
    update: {
      number: pr.number,
      title: pr.title,
      body: pr.body ?? null,
      state,
      authorGithubId,
      authorLogin,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      baseSha: pr.base.sha,
      headSha: pr.head.sha,
      updatedAt: new Date(pr.updated_at),
      closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      syncedAt: new Date(),
    },
  });

  logger.info(
    `Pull request #${pr.number} synced for ${repo.full_name} [${state}] (SHA: ${pr.head.sha.slice(0, 7)})`,
  );
};

export const processGitHubWebhook = async (
  req: Request,
): Promise<{
  received: boolean;
  event: string;
  action?: string;
  duplicate?: boolean;
}> => {
  const { event, deliveryId, payload } = verifyAndExtractGitHubWebhook(req);
  const action = typeof payload.action === "string" ? payload.action : undefined;

  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { deliveryId },
  });

  if (existingEvent?.processed) {
    logger.info(
      `GitHub webhook delivery ${deliveryId} (${event}) was already processed. Skipping duplicate.`,
    );
    return {
      received: true,
      event,
      action,
      duplicate: true,
    };
  }

  await prisma.webhookEvent.upsert({
    where: { deliveryId },
    create: {
      deliveryId,
      event,
      action: action ?? null,
      processed: false,
    },
    update: {
      event,
      action: action ?? null,
    },
  });

  try {
    switch (event) {
      case "ping":
        logger.info("GitHub ping webhook received");
        break;

      case "installation":
        await handleInstallationEvent(payload as unknown as GitHubInstallationPayload);
        break;

      case "installation_repositories":
        await handleInstallationRepositoriesEvent(
          payload as unknown as GitHubInstallationRepositoriesPayload,
        );
        break;

      case "pull_request":
        await handlePullRequestEvent(payload as unknown as GitHubPullRequestPayload);
        break;

      default:
        logger.info(`Unhandled GitHub webhook event: ${event}`);
        break;
    }

    await prisma.webhookEvent.update({
      where: { deliveryId },
      data: {
        processed: true,
        processedAt: new Date(),
        errorMessage: null,
      },
    });

    return {
      received: true,
      event,
      action,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error processing GitHub webhook delivery ${deliveryId} (${event}):`, {
      error,
    });

    await prisma.webhookEvent.update({
      where: { deliveryId },
      data: {
        processed: false,
        errorMessage,
      },
    });

    throw error;
  }
};


export const getUserInstallations = async (userId: string) => {
  return prisma.gitHubInstallation.findMany({
    where: { userId },
    include: {
      repositories: {
        include: {
          settings: true,
          _count: {
            select: { pullRequests: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};


export const getInstallationById = async (id: string, userId: string) => {
  const installation = await prisma.gitHubInstallation.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      repositories: {
        include: {
          settings: true,
          _count: {
            select: { pullRequests: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!installation) {
    throw new ApiError(404, "Installation not found or not accessible by this user");
  }

  return installation;
};

export const linkInstallationToUser = async (installationId: bigint, userId: string) => {
  const existing = await prisma.gitHubInstallation.findUnique({
    where: { installationId },
  });

  if (!existing) {
    throw new ApiError(
      404,
      "Installation not found in database. Ensure the GitHub App has been installed on GitHub.",
    );
  }

  return prisma.gitHubInstallation.update({
    where: { installationId },
    data: { userId },
    include: {
      repositories: {
        include: {
          settings: true,
        },
      },
    },
  });
};


export const updateRepositorySettings = async (
  repositoryId: string,
  userId: string,
  data: UpdateRepositorySettingsDto,
) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      installation: {
        userId,
      },
    },
    include: {
      settings: true,
    },
  });

  if (!repository) {
    throw new ApiError(404, "Repository not found or not accessible by this user");
  }

  if (data.enabled !== undefined) {
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { enabled: data.enabled },
    });
  }

  const settingsUpdate = {
    ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
    ...(data.minimumSeverity ? { minimumSeverity: data.minimumSeverity } : {}),
    ...(data.aiReviewEnabled !== undefined
      ? { aiReviewEnabled: data.aiReviewEnabled }
      : {}),
    ...(data.staticAnalysisEnabled !== undefined
      ? { staticAnalysisEnabled: data.staticAnalysisEnabled }
      : {}),
    ...(data.autoComment !== undefined ? { autoComment: data.autoComment } : {}),
  };

  const updatedSettings = await prisma.repositorySettings.upsert({
    where: { repositoryId },
    create: {
      repositoryId,
      ...settingsUpdate,
    },
    update: settingsUpdate,
  });

  return {
    repositoryId,
    enabled: data.enabled ?? repository.enabled,
    settings: updatedSettings,
  };
};
