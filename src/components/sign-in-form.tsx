"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  completeMagicLink,
  sendMagicLink,
  signInWithGoogle,
} from "@/lib/firebase/client";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "completing" }
  | { kind: "redirecting" }
  | { kind: "error"; message: string };

async function exchangeIdTokenForSession(idToken: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Could not establish session.");
  }
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dest = searchParams.get("from") || "/app";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(() => {
    if (typeof window === "undefined") return { kind: "idle" };
    const href = window.location.href;
    return /[?&]apiKey=/.test(href) || /oobCode=/.test(href)
      ? { kind: "completing" }
      : { kind: "idle" };
  });

  // If the user clicked an email link, complete the sign-in on mount.
  useEffect(() => {
    if (status.kind !== "completing") return;
    let cancelled = false;
    const run = async () => {
      try {
        const user = await completeMagicLink(window.location.href);
        if (cancelled) return;
        if (!user) {
          setStatus({ kind: "idle" });
          return;
        }
        const idToken = await user.getIdToken();
        await exchangeIdTokenForSession(idToken);
        if (cancelled) return;
        setStatus({ kind: "redirecting" });
        router.replace(dest);
        router.refresh();
      } catch (e) {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message: e instanceof Error ? e.message : "Sign-in failed.",
        });
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ kind: "sending" });
    try {
      const redirect = `${window.location.origin}/signin${
        dest && dest !== "/app" ? `?from=${encodeURIComponent(dest)}` : ""
      }`;
      await sendMagicLink(email.trim(), redirect);
      setStatus({ kind: "sent" });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not send link.",
      });
    }
  }

  async function handleGoogle() {
    setStatus({ kind: "sending" });
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      await exchangeIdTokenForSession(idToken);
      setStatus({ kind: "redirecting" });
      router.replace(dest);
      router.refresh();
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Google sign-in failed.",
      });
    }
  }

  if (status.kind === "completing" || status.kind === "redirecting") {
    return (
      <div className="text-sm text-mute">
        {status.kind === "completing"
          ? "Finishing sign-in…"
          : "Signed in. Redirecting…"}
      </div>
    );
  }

  if (status.kind === "sent") {
    return (
      <div>
        <div className="text-sm">
          Check <span className="font-medium">{email}</span> for a sign-in
          link.
        </div>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="text-xs text-mute underline underline-offset-4 mt-3"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleEmail} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs uppercase tracking-widest text-mute mb-2"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.co"
          className="w-full h-12 px-4 rounded-md border border-rule bg-card outline-none focus:border-ink/40 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={status.kind === "sending" || !email.trim()}
        className="w-full h-12 rounded-md bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {status.kind === "sending" ? "Sending…" : "Continue"}
      </button>

      <div className="flex items-center gap-3 text-[11px] text-mute uppercase tracking-widest">
        <span className="flex-1 h-px bg-rule" />
        or
        <span className="flex-1 h-px bg-rule" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={status.kind === "sending"}
        className="w-full h-12 rounded-md border border-rule text-sm font-medium hover:border-ink/40 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Continue with Google
      </button>

      {status.kind === "error" && (
        <div className="text-xs text-accent">{status.message}</div>
      )}
    </form>
  );
}
