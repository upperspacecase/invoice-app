"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { startStripeConnectAction } from "@/app/_actions";
import type { Tier } from "@/lib/types";

const INCLUDED: string[] = [
  "Unlimited invoices, every currency",
  "A pay link on every invoice",
  "Card or bank — your client pays their way",
  "Automatic follow-up on unpaid invoices",
  "Money lands in your bank, not ours",
  "1% only when an invoice gets paid — capped at $2,000/yr",
];

export function BillingPlans({
  stripeAccountId,
}: {
  current: Tier;
  stripeAccountId?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  function connectStripe() {
    setError(null);
    setPending(true);
    startTransition(async () => {
      try {
        const result = await startStripeConnectAction();
        if (result.ok) {
          window.location.href = result.url;
        } else {
          setError(result.reason);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start Connect.");
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-mute">
        Your plan
      </div>
      <div className="font-display text-2xl mt-1" style={{ fontWeight: 800 }}>
        Free <span className="text-mute">+</span>{" "}
        <span style={{ color: "var(--color-paid-deep)" }}>1%</span>
      </div>
      <p className="text-sm text-mute mt-1 leading-relaxed max-w-md">
        No monthly fee. Nudge takes 1% of an invoice only when the money lands
        — capped at $2,000 a year. You only pay when you get paid.
      </p>

      <div
        className="rounded-xl border p-4 mt-5"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--color-paid)" }}
                aria-hidden
              >
                <Check size={11} strokeWidth={3} color="#fff" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {error && <div className="text-xs text-danger mt-4">{error}</div>}

      <div className="text-xs uppercase tracking-widest text-mute mt-10 mb-3">
        Get paid
      </div>
      <div className="rounded-xl border border-rule p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Stripe account</div>
          <div className="text-xs text-mute mt-0.5">
            {stripeAccountId
              ? `Connected · ${stripeAccountId}`
              : "Connect Stripe to put a pay link on every invoice. Money lands in your bank — Nudge's 1% comes off automatically when a client pays."}
          </div>
        </div>
        <button
          type="button"
          onClick={connectStripe}
          disabled={pending}
          className="h-9 px-4 rounded-md text-xs font-medium transition-colors"
          style={{
            background: stripeAccountId
              ? "rgba(28,31,26,0.06)"
              : "var(--color-paid)",
            color: stripeAccountId ? "var(--color-ink)" : "var(--color-paper)",
            opacity: pending ? 0.5 : 1,
          }}
        >
          {pending
            ? "Loading…"
            : stripeAccountId
            ? "Manage in Stripe"
            : "Connect Stripe"}
        </button>
      </div>

      <p className="text-[11px] text-mute mt-6 leading-relaxed">
        Stripe Connect activates when Stripe keys are configured. Without keys
        the connect button is a demo — useful for previewing the flow.
      </p>
    </div>
  );
}
