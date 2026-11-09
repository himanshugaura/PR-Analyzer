import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

import { env } from "./env.js";

/**
 * Normalizes private key strings by resolving escaped newlines (\n)
 * commonly introduced when storing PEM certificates in single-line env files.
 */
const formatPrivateKey = (key: string): string => {
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.includes("\\n")) {
    cleaned = cleaned.replace(/\\n/g, "\n");
  }
  return cleaned;
};

export const createAppOctokit = (): Octokit => {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey: formatPrivateKey(env.GITHUB_PRIVATE_KEY),
    },
  });
};

export const createInstallationOctokit = (
  installationId: number | bigint,
): Octokit => {
  const numericInstallationId =
    typeof installationId === "bigint" ? Number(installationId) : installationId;

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey: formatPrivateKey(env.GITHUB_PRIVATE_KEY),
      installationId: numericInstallationId,
    },
  });
};
