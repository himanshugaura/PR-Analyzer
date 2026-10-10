import { z } from "zod";

export const linkInstallationSchema = z.object({
  installationId: z
    .union([
      z.number().int().positive({ message: "installationId must be a positive integer" }),
      z.string().regex(/^\d+$/, { message: "installationId must be a numeric string" }),
    ])
    .transform((val) => {
      try {
        return BigInt(val);
      } catch {
        throw new Error("Invalid installationId format");
      }
    }),
});

export const updateRepositorySettingsSchema = z
  .object({
    enabled: z.boolean().optional(),
    minimumSeverity: z
      .enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"])
      .optional(),
    aiReviewEnabled: z.boolean().optional(),
    staticAnalysisEnabled: z.boolean().optional(),
    autoComment: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one setting property must be provided for update",
  });

export const installationIdParamSchema = z.object({
  id: z.string().trim().min(1, "Installation ID is required"),
});

export const repositoryIdParamSchema = z.object({
  repositoryId: z.string().trim().min(1, "Repository ID is required"),
});

export const listInstallationsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const gitHubWebhookHeadersSchema = z.object({
  "x-hub-signature-256": z
    .string()
    .trim()
    .min(1, "Missing X-Hub-Signature-256 header")
    .startsWith("sha256=", "X-Hub-Signature-256 header must start with 'sha256='"),
  "x-github-event": z.string().trim().min(1, "Missing X-GitHub-Event header"),
  "x-github-delivery": z.string().trim().min(1, "Missing X-GitHub-Delivery header"),
});

export type LinkInstallationInput = z.infer<typeof linkInstallationSchema>;
export type UpdateRepositorySettingsInput = z.infer<
  typeof updateRepositorySettingsSchema
>;
export type InstallationIdParamInput = z.infer<typeof installationIdParamSchema>;
export type RepositoryIdParamInput = z.infer<typeof repositoryIdParamSchema>;
export type ListInstallationsQueryInput = z.infer<
  typeof listInstallationsQuerySchema
>;
export type GitHubWebhookHeadersInput = z.infer<typeof gitHubWebhookHeadersSchema>;
