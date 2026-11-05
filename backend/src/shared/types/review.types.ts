import type {
  FindingCategory,
  Severity,
  DiffSide,
  ReviewStatus,
  FindingStatus,
} from "../../generated/prisma/enums.js";

export interface AiFindingPayload {
  filePath: string;
  line: number | null;
  startLine?: number | null;
  side?: DiffSide;
  severity: Severity;
  category: FindingCategory;
  title: string;
  message: string;
  suggestion?: string | null;
  confidence?: number;
}

export interface AiReviewAnalysisResult {
  summary?: string;
  findings: AiFindingPayload[];
}

export interface ReviewTriggerOptions {
  pullRequestId: string;
  triggeredById?: string | null;
  forceReReview?: boolean;
}

export interface FindingFilterOptions {
  severity?: Severity;
  category?: FindingCategory;
  status?: FindingStatus;
  filePath?: string;
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
