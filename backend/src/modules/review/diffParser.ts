import crypto from "node:crypto";
import type { GitHubPullRequestFile } from "../../shared/types/github.types.js";

const IGNORED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".webm",
  ".zip",
  ".tar",
  ".gz",
  ".map",
  ".min.js",
  ".min.css",
]);

const IGNORED_FILENAMES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "cargo.lock",
  "gemfile.lock",
  "composer.lock",
  "poetry.lock",
]);

const IGNORED_PATH_SEGMENTS = [
  "/dist/",
  "/build/",
  "/.next/",
  "/node_modules/",
  "/generated/",
  "/vendor/",
  "/coverage/",
];

/**
 * Checks whether a given file path should be analyzed by the AI reviewer.
 */
export const isReviewableFile = (filename: string): boolean => {
  const normalized = filename.toLowerCase();

  // Check exact ignored filenames
  const baseName = normalized.split("/").pop() || "";
  if (IGNORED_FILENAMES.has(baseName)) {
    return false;
  }

  // Check extensions
  for (const ext of IGNORED_EXTENSIONS) {
    if (normalized.endsWith(ext)) {
      return false;
    }
  }

  // Check path segments
  const slashNormalized = `/${normalized}`;
  for (const segment of IGNORED_PATH_SEGMENTS) {
    if (slashNormalized.includes(segment)) {
      return false;
    }
  }

  return true;
};

/**
 * Takes GitHub changed files and formats a clear, line-annotated code representation
 * so the LLM can reference accurate line numbers when reporting findings.
 */
export const formatFilesForPrompt = (
  files: GitHubPullRequestFile[],
  maxChars = 60000,
): { formattedDiff: string; reviewedFileCount: number; truncated: boolean } => {
  const reviewable = files.filter(
    (f) => f.status !== "removed" && isReviewableFile(f.filename) && f.patch,
  );

  let output = "";
  let reviewedFileCount = 0;
  let truncated = false;

  for (const file of reviewable) {
    if (!file.patch) continue;

    const fileHeader = `\n--- FILE: ${file.filename} (Status: ${file.status}, +${file.additions} -${file.deletions}) ---\n`;
    const annotatedPatch = annotateHunkLines(file.patch);

    const block = `${fileHeader}${annotatedPatch}\n`;

    if (output.length + block.length > maxChars) {
      output += `\n[Diff truncated: token size limit reached after ${reviewedFileCount} files]\n`;
      truncated = true;
      break;
    }

    output += block;
    reviewedFileCount++;
  }

  return {
    formattedDiff: output.trim(),
    reviewedFileCount,
    truncated,
  };
};

/**
 * Parses git hunk header (e.g. @@ -10,4 +12,6 @@) and prefixes each line with its target line number.
 */
export const annotateHunkLines = (patch: string): string => {
  const lines = patch.split("\n");
  const result: string[] = [];
  let currentNewLine = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      result.push(line);
      // Example: @@ -1,7 +1,9 @@ -> extract +1
      const match = /\+([0-9]+)/.exec(line);
      if (match && match[1]) {
        currentNewLine = Number.parseInt(match[1], 10);
      }
      continue;
    }

    if (line.startsWith("+")) {
      result.push(`Line ${currentNewLine} (+): ${line.slice(1)}`);
      currentNewLine++;
    } else if (line.startsWith("-")) {
      result.push(`(-) ${line.slice(1)}`);
    } else {
      result.push(`Line ${currentNewLine} ( ): ${line.slice(1)}`);
      currentNewLine++;
    }
  }

  return result.join("\n");
};

/**
 * Generates a deterministic fingerprint for a finding.
 */
export const generateFindingFingerprint = (
  filePath: string,
  line: number | null,
  category: string,
  title: string,
): string => {
  const normalized = `${filePath.trim()}:${line ?? 0}:${category.trim().toUpperCase()}:${title.trim().toLowerCase()}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
};
