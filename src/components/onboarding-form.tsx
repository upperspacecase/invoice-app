"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { updateBusinessAction } from "@/app/_actions";
import type { Business } from "@/lib/types";

export function OnboardingForm({ initial }: { initial: Business }) {
  const router = useRouter();
  const [name, setName] = useState(
    initial.name === "Studio Ltd" ? "" : initial.name
  );
  const [email, setEmail] = useState(initial.email);
  const [payment, setPayment] = useState(
    initial.payment === "Wise — IBAN GB29 NWBK 6016 1331 9268 19"
      ? ""
      : initial.payment
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateBusinessAction({
          name: name.trim() || initial.name,
          email: email.trim() || initial.email,
          payment: payment.trim() || initial.payment,
          onboarded: true,
        });
        router.replace("/app");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  function skip() {
    setError(null);
    startTransition(async () => {
      try {
        await updateBusinessAction({ onboarded: true });
        router.replace("/app");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not skip.");
      }
    });
  }

  return (
    <div className="pt-12 max-w-md mx-auto">
      <h1
        className="font-serif text-4xl leading-tight"
        style={{ fontWeight: 400 }}
      >
        Set your details once.
      </h1>
      <p className="text-sm text-mute mt-3 mb-8">
        Two minutes now saves you typing on every invoice. You can change these
        any time in Settings.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label
            htmlFor="biz-name"
            className="block text-xs uppercase tracking-widest text-mute mb-2"
          >
            Business name
          </label>
          <input
            id="biz-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Studio Ltd"
            autoFocus
            className="w-full h-11 px-4 rounded-md border border-rule bg-card outline-none focus:border-ink/40 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="biz-email"
            className="block text-xs uppercase tracking-widest text-mute mb-2"
          >
            Email on invoices
          </label>
          <input
            id="biz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourstudio.co"
            className="w-full h-11 px-4 rounded-md border border-rule bg-card outline-none focus:border-ink/40 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="biz-payment"
            className="block text-xs uppercase tracking-widest text-mute mb-2"
          >
            Payment details
          </label>
          <textarea
            id="biz-payment"
            rows={2}
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="e.g. Wise — IBAN GB29 NWBK… or bank account"
            className="w-full px-4 py-3 rounded-md border border-rule bg-card outline-none focus:border-ink/40 text-sm resize-none"
          />
        </div>

        {error && <div className="text-xs text-accent">{error}</div>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="h-11 px-6 rounded-md bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {pending ? "Saving…" : "Continue"}
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={skip}
            disabled={pending}
            className="text-xs text-mute hover:text-ink underline underline-offset-4 disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
