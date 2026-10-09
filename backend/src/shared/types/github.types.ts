import type { Severity } from "../../generated/prisma/enums.js";

export interface GitHubAccountPayload {
  id: number;
  login: string;
  type: "User" | "Organization" | string;
  avatar_url?: string;
}

export interface GitHubUserPayload {
  id: number;
  login: string;
  avatar_url?: string;
  type?: string;
}

export interface GitHubRepositoryPayload {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch?: string | null;
  owner?: {
    id?: number;
    login: string;
  };
  html_url?: string;
  description?: string | null;
}

export interface GitHubInstallationPayload {
  action: "created" | "deleted" | "suspend" | "unsuspend" | "new_permissions_accepted" | string;
  installation: {
    id: number;
    account: GitHubAccountPayload;
    suspended_at?: string | null;
    target_type?: string;
    permissions?: Record<string, string>;
    events?: string[];
  };
  repositories?: GitHubRepositoryPayload[];
  sender: GitHubUserPayload;
}

export interface GitHubInstallationRepositoriesPayload {
  action: "added" | "removed" | string;
  installation: {
    id: number;
    account: GitHubAccountPayload;
  };
  repository_selection?: "all" | "selected" | string;
  repositories_added?: GitHubRepositoryPayload[];
  repositories_removed?: GitHubRepositoryPayload[];
  sender: GitHubUserPayload;
}

export interface GitHubPullRequestPayload {
  action:
    | "opened"
    | "closed"
    | "reopened"
    | "synchronize"
    | "edited"
    | "assigned"
    | "unassigned"
    | "review_requested"
    | "review_request_removed"
    | "labeled"
    | "unlabeled"
    | string;
  number: number;
  installation?: {
    id: number;
    node_id?: string;
  };
  repository: GitHubRepositoryPayload;
  pull_request: {
    id: number;
    number: number;
    title: string;
    body?: string | null;
    state: "open" | "closed" | string;
    merged?: boolean | null;
    user: GitHubUserPayload;
    base: {
      ref: string;
      sha: string;
    };
    head: {
      ref: string;
      sha: string;
    };
    created_at: string;
    updated_at: string;
    closed_at?: string | null;
    merged_at?: string | null;
  };
  sender: GitHubUserPayload;
}

export interface GitHubPingPayload {
  zen: string;
  hook_id: number;
  hook?: Record<string, unknown>;
}

export interface LinkInstallationDto {
  installationId: number | string;
}

export interface UpdateRepositorySettingsDto {
  enabled?: boolean;
  minimumSeverity?: Severity;
  aiReviewEnabled?: boolean;
  staticAnalysisEnabled?: boolean;
  autoComment?: boolean;
}
