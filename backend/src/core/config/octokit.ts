
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

import { env } from "../../core/config/env.js";

export const createInstallationOctokit = (
  installationId: number,
): Octokit => {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_PRIVATE_KEY,
      installationId,
    },
  });
};
