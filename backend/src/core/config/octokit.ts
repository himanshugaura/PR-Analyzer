import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

import { env } from "./env.js";

/**
 * Normalizes private key strings by resolving escaped newlines (\n)
 * commonly introduced when storing PEM certificates in single-line env files.
 */
const formatPrivateKey = (key: string): string => {
  if (key.includes("-----BEGIN") && !key.includes("\n") && key.includes("\\n")) {
    return key.replace(/\\n/g, "\n");
  }
  return key;
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
