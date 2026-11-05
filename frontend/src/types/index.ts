export type GitHubAccountType = "USER" | "ORGANIZATION";

export type PullRequestState = "OPEN" | "CLOSED" | "MERGED";

export type ReviewStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type FindingCategory =
  | "BUG"
  | "SECURITY"
  | "PERFORMANCE"
  | "CODE_QUALITY"
  | "STYLE"
  | "MAINTAINABILITY"
  | "ERROR_HANDLING"
  | "TESTING"
  | "DATABASE"
  | "API"
  | "OTHER";

export type FindingStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type CommentStatus = "PENDING" | "POSTED" | "FAILED";

export type DiffSide = "LEFT" | "RIGHT";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  [key: string]: unknown;
}

export interface RepositorySettings {
  id: string;
  repositoryId: string;
  enabled: boolean;
  minimumSeverity: Severity;
  aiReviewEnabled: boolean;
  staticAnalysisEnabled: boolean;
  autoComment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  ownerLogin: string;
  private: boolean;
  defaultBranch?: string | null;
  installationId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: RepositorySettings | null;
  _count?: {
    pullRequests: number;
  };
}

export interface GitHubInstallation {
  id: string;
  installationId: string;
  accountId: string;
  accountType: GitHubAccountType;
  userId?: string | null;
  suspendedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  repositories: Repository[];
}

export interface Finding {
  id: string;
  reviewId: string;
  severity: Severity;
  category: FindingCategory;
  title: string;
  message: string;
  suggestion?: string | null;
  filePath: string;
  line?: number | null;
  startLine?: number | null;
  side: DiffSide;
  githubCommentId?: string | null;
  commentStatus: CommentStatus;
  fingerprint: string;
  confidence?: number | null;
  status: FindingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewMetrics {
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  status: ReviewStatus;
}

export interface Review {
  id: string;
  pullRequestId: string;
  headSha: string;
  status: ReviewStatus;
  triggeredById?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  model?: string | null;
  promptVersion?: string | null;
  totalFindings: number;
  createdAt: string;
  updatedAt: string;
  findings: Finding[];
  pullRequest?: PullRequest;
}

export interface PullRequest {
  id: string;
  githubId: string;
  number: number;
  title: string;
  body?: string | null;
  state: PullRequestState;
  authorGithubId?: string | null;
  authorLogin?: string | null;
  baseBranch: string;
  headBranch: string;
  baseSha: string;
  headSha: string;
  repositoryId: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  mergedAt?: string | null;
  syncedAt: string;
  repository?: Repository;
  reviews?: Array<{
    id: string;
    status: ReviewStatus;
    totalFindings: number;
    createdAt: string;
    findings?: Finding[];
    _count?: {
      findings: number;
    };
  }>;
  _count?: {
    reviews: number;
  };
}

export interface GitHubPullRequestFile {
  sha: string | null;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export interface PullRequestDiffData {
  owner: string;
  repo: string;
  pullNumber: number;
  baseSha: string;
  headSha: string;
  rawDiff: string;
  files: GitHubPullRequestFile[];
}
