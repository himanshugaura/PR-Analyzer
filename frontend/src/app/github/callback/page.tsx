"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Container } from "../../../components/layout/container";
import { Button } from "../../../components/ui/button";
import { useLinkInstallation } from "../../../hooks/use-installations";

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installation_id");

  const { isLoaded, isSignedIn, getToken } = useAuth();
  const linkMutation = useLinkInstallation();

  const [status, setStatus] = useState<"linking" | "success" | "error" | "out_of_session">("linking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isExecutingRef = useRef(false);

  const attemptLink = async (currentAttempt = 0) => {
    if (!installationId) {
      setStatus("error");
      setErrorMessage("Missing installation_id parameter in callback URL from GitHub.");
      return;
    }

    try {
      setStatus("linking");
      setRetryCount(currentAttempt);

      // Explicitly retrieve and verify active Clerk token
      const token = await getToken();
      if (!token) {
        setStatus("out_of_session");
        setErrorMessage("No active session found. Please sign in to link your GitHub App.");
        return;
      }

      await linkMutation.mutateAsync(installationId);
      setStatus("success");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      // Check for authentication / session loss error
      if (msg.includes("Authentication required") || msg.includes("401") || msg.includes("session")) {
        setStatus("out_of_session");
        setErrorMessage("Your session expired during GitHub installation. Please sign in to finish linking.");
        return;
      }

      // Retry up to 3 times on cold-start / connection timeout
      if (currentAttempt < 2) {
        setRetryCount(currentAttempt + 1);
        setTimeout(() => {
          attemptLink(currentAttempt + 1);
        }, 2500);
        return;
      }

      setStatus("error");
      setErrorMessage(
        msg.includes("timeout") || msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Connection timed out. The server may be waking up from sleep, or GitHub API took too long to respond."
          : msg || "Failed to link your GitHub installation.",
      );
    } finally {
      isExecutingRef.current = false;
    }
  };

  useEffect(() => {
    // Wait until Clerk auth state is fully loaded
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus("out_of_session");
      setErrorMessage("No active user session detected. Please sign in to link your GitHub account.");
      return;
    }

    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    attemptLink(0);
  }, [isLoaded, isSignedIn, installationId]);

  return (
    <Container className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 text-center shadow-xl">
        {/* 1. Linking in Progress */}
        {status === "linking" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Connecting GitHub App
              </h2>
              <p className="mt-1 text-xs text-zinc-400 font-mono">
                Installation ID: #{installationId || "..."}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                {retryCount > 0
                  ? `Server waking up... retrying connection (Attempt ${retryCount + 1}/3)`
                  : "Syncing repositories and registering automated review webhooks..."}
              </p>
            </div>
          </div>
        )}

        {/* 2. Success */}
        {status === "success" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-900/50 bg-emerald-950/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
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

        {/* 3. Out of Session */}
        {status === "out_of_session" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-900/50 bg-amber-950/30">
              <LogIn className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Sign In Required
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                {errorMessage || "Your session expired while completing the GitHub installation."}
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(
                  `/github/callback?installation_id=${installationId || ""}`,
                )}`}
                className="w-full"
              >
                <Button className="w-full text-xs font-semibold gap-1.5 bg-amber-500 hover:bg-amber-400 text-black">
                  <span>Sign In & Complete Setup</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="w-full text-xs border-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* 4. Connection Error / Timeout */}
        {status === "error" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-900/40 bg-red-950/30">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                Connection Notice
              </h2>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{errorMessage}</p>
              <p className="mt-2 text-[11px] text-zinc-500">
                Don&apos;t worry: Your GitHub App installation is saved on GitHub. You can retry now or return to the dashboard.
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <Button
                size="sm"
                onClick={() => attemptLink(0)}
                className="w-full text-xs gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="w-full text-xs border-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                Go to Dashboard
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
