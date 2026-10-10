import { z } from "zod";

export const clerkWebhookHeadersSchema = z.object({
  "svix-id": z.string().trim().min(1, "Missing or empty svix-id header"),
  "svix-timestamp": z
    .string()
    .trim()
    .min(1, "Missing or empty svix-timestamp header"),
  "svix-signature": z
    .string()
    .trim()
    .min(1, "Missing or empty svix-signature header"),
});

export const clerkWebhookEventSchema = z.object({
  type: z.string().trim().min(1, "Clerk webhook event type is required"),
  data: z.record(z.string(), z.unknown()),
  object: z.string().optional(),
});


export const gitHubWebhookHeadersSchema = z.object({
  "x-hub-signature-256": z
    .string()
    .trim()
    .min(1, "Missing X-Hub-Signature-256 header")
    .startsWith("sha256=", "X-Hub-Signature-256 header must start with 'sha256='"),
  "x-github-event": z
    .string()
    .trim()
    .min(1, "Missing X-GitHub-Event header"),
  "x-github-delivery": z
    .string()
    .trim()
    .min(1, "Missing X-GitHub-Delivery header"),
});

export type ClerkWebhookHeadersInput = z.infer<
  typeof clerkWebhookHeadersSchema
>;
export type ClerkWebhookEventInput = z.infer<
  typeof clerkWebhookEventSchema
>;
export type GitHubWebhookHeadersInput = z.infer<
  typeof gitHubWebhookHeadersSchema
>;
