"use client";

import { useState, useTransition } from "react";
import { startStripeConnectAction } from "@/app/_actions";

const INCLUDED: string[] = [
  "Unlimited invoices and clients",
  "PDF + email delivery",
  "Multi-currency with live FX",
  "Stripe payment links",
  "Branded invoices — your color on every PDF",
  "Deliver via QuickBooks, Xero & Slack",
  "Smart follow-ups — a kind AI assistant",
  "Agent API",
];

export function BillingPlans({
  stripeAccountId,
}: {
  stripeAccountId?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      <div className="mb-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          Your plan
        </div>
        <div className="text-2xl font-serif mt-1" style={{ fontWeight: 400 }}>
          Everything — 1% per paid invoice
        </div>
      </div>

      {error && <div className="text-xs text-black mb-3">{error}</div>}

      <div className="rounded-xl border border-black bg-black text-white p-5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-4xl" style={{ fontWeight: 300 }}>
            1%
          </span>
          <span className="text-xs text-white/60">per paid invoice</span>
        </div>
        <div className="text-xs text-white/70 mt-2">
          No subscription, no monthly fee. We take 1% only when an invoice is
          paid — and every feature is included.
        </div>
        <ul className="text-xs space-y-1.5 mt-4">
          {INCLUDED.map((h) => (
            <li key={h} className="text-white/80">
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs uppercase tracking-widest text-neutral-500 mt-10 mb-3">
        Receive payments
      </div>
      <div className="rounded-xl border border-neutral-200 p-4 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Stripe account</div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {stripeAccountId
              ? `Connected · ${stripeAccountId}`
              : "Connect your Stripe to attach a payment link to every invoice. Money lands in your bank — we take our 1% as the payment fee."}
          </div>
        </div>
        <button
          type="button"
          onClick={connectStripe}
          disabled={pending}
          className="h-9 px-4 rounded-md text-xs font-medium transition-colors"
          style={{
            background: stripeAccountId ? "#f5f5f5" : "#000000",
            color: stripeAccountId ? "#000000" : "#ffffff",
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

      <p className="text-[11px] text-neutral-500 mt-6 leading-relaxed">
        Stripe Connect activates when Stripe keys are configured. The 1%
        platform fee is collected automatically on each payment — there is
        nothing else to set up.
      </p>
    </div>
  );
}
