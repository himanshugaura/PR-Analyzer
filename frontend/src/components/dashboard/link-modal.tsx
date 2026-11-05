"use client";

import { useState } from "react";
import { Link as LinkIcon, AlertCircle } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useUiStore } from "../../store/use-ui-store";
import { useLinkInstallation } from "../../hooks/use-installations";

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
            <DialogTitle>Connect GitHub Installation</DialogTitle>
          </div>
          <DialogDescription>
            Enter the installation ID from your GitHub App configuration to link your repositories to this account.
          </DialogDescription>
        </DialogHeader>

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
              autoFocus
            />
            <p className="text-[11px] text-zinc-400">
              Found in the redirect URL after installing the GitHub App:{" "}
              <code className="text-zinc-600 dark:text-zinc-300">?installation_id=...</code>
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-zinc-300 bg-zinc-50 p-2.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
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
            Connect
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
