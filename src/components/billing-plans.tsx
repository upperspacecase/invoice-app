"use client";

import { useState, useTransition } from "react";
import { setTierAction } from "@/app/_actions";
import { TIER_RANK } from "@/lib/types";
import type { Tier } from "@/lib/types";

type Plan = {
  id: Tier;
  name: string;
  monthly: number;
  annualMonthly: number;
  cadence: string;
  for: string;
  highlights: string[];
  guarantee?: string;
};

const PLANS: Plan[] = [
  {
    id: "send",
    name: "Send",
    monthly: 0,
    annualMonthly: 0,
    cadence: "forever",
    for: "Trying it on a single client.",
    highlights: [
      "3 invoices per month",
      "1 saved client",
      "PDF + email delivery",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    annualMonthly: 9,
    cadence: "per month",
    for: "Committed solo op.",
    highlights: [
      "Unlimited invoices and clients",
      "Multi-currency with live FX",
      "Stripe payment links (coming soon)",
      "Branded invoice — logo + color (coming soon)",
      "Client integrations (QuickBooks, Xero, Slack)",
      "Agent API",
    ],
    guarantee:
      "If your client doesn't open within 24 hours, next month is on us.",
  },
  {
    id: "get-paid",
    name: "Get Paid",
    monthly: 29,
    annualMonthly: 24,
    cadence: "per month",
    for: "Retainer-runner. Tired of chasing.",
    highlights: [
      "Everything in Pro",
      "Smart followups — polite → firm → final (coming soon)",
      "Recurring invoices for retainers (coming soon)",
      "Late-fee policy (coming soon)",
    ],
    guarantee:
      "24-hour open guarantee, plus: if smart followups don't recover at least one stuck invoice in 60 days, full refund.",
  },
];

export function BillingPlans({ current }: { current: Tier }) {
  const [annual, setAnnual] = useState(true);
  const [pendingId, setPendingId] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function pick(tier: Tier) {
    if (tier === current) return;
    setError(null);
    setPendingId(tier);
    startTransition(async () => {
      try {
        await setTierAction(tier);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not switch plan.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-4 gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-mute">
            Your plan
          </div>
          <div className="text-2xl font-serif mt-1" style={{ fontWeight: 400 }}>
            {labelFor(current)}
          </div>
        </div>
        <div
          role="tablist"
          className="text-xs rounded-full border border-rule overflow-hidden inline-flex"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!annual}
            onClick={() => setAnnual(false)}
            className="px-3 py-1.5"
            style={{
              background: !annual ? "var(--color-ink)" : "transparent",
              color: !annual ? "var(--color-paper)" : "var(--color-mute)",
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={annual}
            onClick={() => setAnnual(true)}
            className="px-3 py-1.5"
            style={{
              background: annual ? "var(--color-ink)" : "transparent",
              color: annual ? "var(--color-paper)" : "var(--color-mute)",
            }}
          >
            Annual
            <span className="ml-1 text-[10px]" style={{ opacity: 0.7 }}>
              save 25%
            </span>
          </button>
        </div>
      </div>

      {error && <div className="text-xs text-accent mb-3">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const price = annual ? plan.annualMonthly : plan.monthly;
          const isCurrent = plan.id === current;
          const isLower = TIER_RANK[plan.id] < TIER_RANK[current];
          const cta = isCurrent
            ? "Current plan"
            : isLower
            ? `Switch to ${plan.name}`
            : `Upgrade to ${plan.name}`;
          const busy = pendingId === plan.id;
          const popular = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className="rounded-xl border p-4 flex flex-col gap-3"
              style={{
                borderColor: isCurrent
                  ? "var(--color-ink)"
                  : "var(--color-rule)",
                background: isCurrent ? "rgba(10,10,10,0.03)" : "transparent",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium">{plan.name}</div>
                  <div className="text-xs text-mute mt-0.5">{plan.for}</div>
                </div>
                {popular && !isCurrent && (
                  <span
                    className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{
                      color: "var(--color-paid)",
                      background: "rgba(45,122,79,0.1)",
                    }}
                  >
                    Most popular
                  </span>
                )}
                {isCurrent && (
                  <span
                    className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{
                      color: "var(--color-ink)",
                      background: "rgba(10,10,10,0.06)",
                    }}
                  >
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl" style={{ fontWeight: 300 }}>
                  ${price}
                </span>
                <span className="text-xs text-mute">{plan.cadence}</span>
                {plan.id !== "send" && annual && (
                  <span className="text-[10px] text-mute ml-1">
                    billed yearly
                  </span>
                )}
              </div>

              <ul className="text-xs space-y-1.5 flex-1">
                {plan.highlights.map((h) => (
                  <li key={h} className="text-ink/80">
                    {h}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => pick(plan.id)}
                disabled={isCurrent || busy}
                className="h-9 rounded-md text-xs font-medium transition-colors disabled:cursor-not-allowed"
                style={{
                  background: isCurrent
                    ? "rgba(10,10,10,0.06)"
                    : "var(--color-ink)",
                  color: isCurrent ? "var(--color-mute)" : "var(--color-paper)",
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {busy ? "Switching…" : cta}
              </button>

              {plan.guarantee && (
                <div className="text-[11px] text-mute leading-relaxed pt-1 border-t border-rule">
                  {plan.guarantee}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-mute mt-6 leading-relaxed">
        Demo billing — clicking switches your tier directly. Real Stripe
        Checkout lands with the payment-links work in PLAN.md.
      </p>
    </div>
  );
}

function labelFor(t: Tier): string {
  switch (t) {
    case "send":
      return "Send (free)";
    case "pro":
      return "Pro";
    case "get-paid":
      return "Get Paid";
  }
}
