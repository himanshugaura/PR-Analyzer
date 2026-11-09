"use client";

import { useState } from "react";
import { Link as LinkIcon, AlertCircle, ExternalLink } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useUiStore } from "../../store/use-ui-store";
import { useLinkInstallation } from "../../hooks/use-installations";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/pr-analyzer-ai/installations/new";

export function LinkInstallationModal() {
  const isOpen = useUiStore((s) => s.isLinkModalOpen);
  const setOpen = useUiStore((s) => s.setLinkModalOpen);
  const [installationIdInput, setInstallationIdInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const linkMutation = useLinkInstallation();

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = installationIdInput.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid numeric GitHub Installation ID.");
      return;
    }

    try {
      await linkMutation.mutateAsync(trimmed);
      setInstallationIdInput("");
      setOpen(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to link installation. Make sure the GitHub App is installed on your account.",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <form onSubmit={handleLink}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-zinc-100 dark:bg-zinc-800">
              <LinkIcon className="h-3.5 w-3.5" />
            </div>
            <DialogTitle>Connect GitHub Repositories</DialogTitle>
          </div>
          <DialogDescription>
            Install the GitHub App to automatically link your repositories, or enter an installation ID directly.
          </DialogDescription>
        </DialogHeader>

        {/* Option 1: Automatic 1-click Install */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-zinc-100">
                Automatic Setup (Recommended)
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Install on GitHub and repositories link automatically.
              </p>
            </div>
            <a
              href={GITHUB_APP_INSTALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <Button size="sm" type="button" className="gap-1 text-xs h-8">
                <span>Install</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-950 px-2 text-[10px] uppercase font-mono text-zinc-500">
            Or link manually
          </span>
        </div>

        {/* Option 2: Manual ID */}
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Installation ID
            </label>
            <Input
              placeholder="e.g. 58392104"
              value={installationIdInput}
              onChange={(e) => {
                setInstallationIdInput(e.target.value);
                setErrorMsg(null);
              }}
            />
            <p className="text-[11px] text-zinc-500">
              Found in the redirect URL after installing:{" "}
              <code className="text-zinc-400">?installation_id=...</code>
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-zinc-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={linkMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={linkMutation.isPending}
            disabled={!installationIdInput.trim()}
          >
            Link Installation
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
