"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Settings, LogOut } from "lucide-react";
import { signOutClient } from "@/lib/firebase/client";
import { Wordmark } from "@/components/wordmark";

export function AppHeader() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function signOut() {
    setError(null);
    start(async () => {
      try {
        await signOutClient().catch(() => {
          /* ignore — still want to clear the cookie */
        });
        await fetch("/api/session", { method: "DELETE" });
        router.replace("/");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Sign-out failed.");
      }
    });
  }

  return (
    <header className="px-6 sm:px-10 lg:px-14 py-5 border-b border-rule">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/app" aria-label="Nudge home">
          <Wordmark size="sm" />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/app/settings"
            aria-label="Settings"
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
          >
            <Settings size={16} />
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={pending}
            aria-label="Sign out"
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
      {error && (
        <div className="text-[11px] text-accent text-center mt-1">{error}</div>
      )}
    </header>
  );
}
