"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Container } from "../../../components/layout/container";
import { Button } from "../../../components/ui/button";
import { useLinkInstallation } from "../../../hooks/use-installations";

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installation_id");

  const [status, setStatus] = useState<"linking" | "success" | "error">("linking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const linkMutation = useLinkInstallation();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;

    if (!installationId) {
      setStatus("error");
      setErrorMessage("Missing installation_id parameter in callback URL from GitHub.");
      return;
    }

    hasTriggered.current = true;

    linkMutation
      .mutateAsync(installationId)
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to link your GitHub installation. Please try again.",
        );
      });
  }, [installationId, linkMutation, router]);

  return (
    <Container className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 text-center shadow-xl">
        {status === "linking" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-100" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Connecting GitHub App
              </h2>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                Installation ID: #{installationId || "..."}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Syncing repositories and registering automated AI review webhooks...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <CheckCircle2 className="h-6 w-6 text-zinc-100" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Installation Connected!
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Your repositories are now connected. Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <AlertCircle className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Connection Failed
              </h2>
              <p className="mt-1 text-xs text-zinc-400">{errorMessage}</p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="w-full text-xs"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </Container>
      }
    >
      <GitHubCallbackContent />
    </Suspense>
  );
}
