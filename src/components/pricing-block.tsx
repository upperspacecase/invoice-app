"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

type Plan = {
  id: "send" | "pro" | "get-paid";
  name: string;
  monthly: number;
  annualMonthly: number;
  cadence: string;
  for: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
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
    features: [
      "3 invoices per month",
      "1 saved client",
      "PDF + email delivery",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    annualMonthly: 9,
    cadence: "per month",
    for: "Committed solo op.",
    features: [
      "Unlimited invoices and clients",
      "Multi-currency · live FX",
      "Stripe payment links",
      "Branded invoice — logo + color",
      "QuickBooks, Xero, Slack delivery",
      "Agent API",
    ],
    cta: "Start Pro",
    highlighted: true,
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
    features: [
      "Everything in Pro",
      "Smart followups — polite → firm → final",
      "Recurring invoices for retainers",
      "Late-fee policy",
    ],
    cta: "Start Get Paid",
    guarantee:
      "24-hour open guarantee · if smart followups don't recover a stuck invoice in 60 days, full refund.",
  },
];

export function PricingBlock() {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="px-6 sm:px-10 lg:px-14 py-20 sm:py-24 border-t border-rule"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start mb-10">
          <div>
            <h2
              className="font-serif text-4xl sm:text-5xl leading-[1.05]"
              style={{ fontWeight: 400 }}
            >
              Pricing
            </h2>
            <p className="text-sm text-mute mt-3 max-w-xs">
              Stop chasing payments. Start receiving them.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <div
              role="tablist"
              aria-label="Billing cadence"
              className="inline-flex text-xs rounded-full border border-rule overflow-hidden"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!annual}
                onClick={() => setAnnual(false)}
                className="px-3.5 py-2"
                style={{
                  background: !annual ? "var(--color-ink)" : "transparent",
                  color: !annual
                    ? "var(--color-paper)"
                    : "var(--color-mute)",
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={annual}
                onClick={() => setAnnual(true)}
                className="px-3.5 py-2 inline-flex items-center gap-1.5"
                style={{
                  background: annual ? "var(--color-ink)" : "transparent",
                  color: annual ? "var(--color-paper)" : "var(--color-mute)",
                }}
              >
                Annual
                <span className="text-[10px]" style={{ opacity: 0.75 }}>
                  save 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>

        <p className="text-xs text-mute mt-6 text-center">
          No card required for Send. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

function PricingCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? plan.annualMonthly : plan.monthly;
  return (
    <div
      className="rounded-2xl border p-6 flex flex-col"
      style={{
        background: plan.highlighted ? "var(--color-ink)" : "var(--color-card)",
        color: plan.highlighted ? "var(--color-paper)" : "var(--color-ink)",
        borderColor: plan.highlighted
          ? "var(--color-ink)"
          : "var(--color-rule)",
      }}
    >
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">{plan.name}</div>
        {plan.highlighted && (
          <span
            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
            style={{
              color: "var(--color-paper)",
              background: "rgba(255,255,255,0.12)",
            }}
          >
            Most popular
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-4xl" style={{ fontWeight: 300 }}>
          ${price}
        </span>
        <span
          className="text-xs"
          style={{
            color: plan.highlighted
              ? "rgba(255,255,255,0.6)"
              : "var(--color-mute)",
          }}
        >
          {plan.cadence}
        </span>
        {plan.id !== "send" && annual && (
          <span
            className="text-[10px] ml-1"
            style={{
              color: plan.highlighted
                ? "rgba(255,255,255,0.6)"
                : "var(--color-mute)",
            }}
          >
            billed yearly
          </span>
        )}
      </div>

      <div
        className="text-xs mt-2"
        style={{
          color: plan.highlighted
            ? "rgba(255,255,255,0.7)"
            : "var(--color-mute)",
        }}
      >
        {plan.for}
      </div>

      <ul className="mt-6 space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="text-sm flex items-start gap-2">
            <Check
              size={14}
              className="mt-1 flex-shrink-0"
              style={{
                color: plan.highlighted
                  ? "rgba(255,255,255,0.8)"
                  : "var(--color-ink)",
              }}
              strokeWidth={2}
            />
            <span style={{ opacity: 0.9 }}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signin"
        className="mt-6 text-sm font-medium px-4 py-2.5 rounded-md text-center transition-colors"
        style={{
          background: plan.highlighted
            ? "var(--color-paper)"
            : "var(--color-ink)",
          color: plan.highlighted ? "var(--color-ink)" : "var(--color-paper)",
        }}
      >
        {plan.cta}
      </Link>

      {plan.guarantee && (
        <div
          className="text-[11px] mt-4 leading-relaxed pt-3 border-t"
          style={{
            borderColor: plan.highlighted
              ? "rgba(255,255,255,0.15)"
              : "var(--color-rule)",
            color: plan.highlighted
              ? "rgba(255,255,255,0.8)"
              : "var(--color-mute)",
          }}
        >
          {plan.guarantee}
        </div>
      )}
    </div>
  );
}
