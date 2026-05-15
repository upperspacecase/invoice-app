"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

type Plan = {
  id: "send" | "pro" | "get-paid";
  name: string;
  monthly: number;
  annualMonthly: number;
  blurb: string;
  features: string[];
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "send",
    name: "Free",
    monthly: 0,
    annualMonthly: 0,
    blurb: "3 invoices / month",
    features: ["1 client", "PDF invoice", "Email send"],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    annualMonthly: 9,
    blurb: "Everything you need",
    features: [
      "Unlimited invoices",
      "Unlimited clients",
      "Automatic reminders",
      "Branding",
      "Payment links",
    ],
    highlighted: true,
  },
  {
    id: "get-paid",
    name: "Get Paid",
    monthly: 29,
    annualMonthly: 24,
    blurb: "For retainer-runners",
    features: [
      "Everything in Pro",
      "Smart followups",
      "Recurring invoices",
      "Late-fee policy",
    ],
  },
];

export function PricingBlock() {
  const [annual, setAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="px-6 sm:px-10 lg:px-14 py-16 sm:py-20 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <h2
            className="font-serif text-3xl sm:text-4xl leading-tight tracking-tight"
            style={{ fontWeight: 700 }}
          >
            Pricing
          </h2>
          <div
            role="tablist"
            aria-label="Billing cadence"
            className="inline-flex text-xs rounded-full p-1"
            style={{ background: "rgba(10,10,10,0.06)" }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={!annual}
              onClick={() => setAnnual(false)}
              className="px-3.5 py-1.5 rounded-full transition-colors"
              style={{
                background: !annual ? "var(--color-paper)" : "transparent",
                color: !annual ? "var(--color-ink)" : "var(--color-mute)",
                boxShadow: !annual
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={annual}
              onClick={() => setAnnual(true)}
              className="px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5"
              style={{
                background: annual ? "var(--color-paper)" : "transparent",
                color: annual ? "var(--color-ink)" : "var(--color-mute)",
                boxShadow: annual ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              Annual
              <span className="text-[10px]" style={{ opacity: 0.65 }}>
                save 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} annual={annual} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? plan.annualMonthly : plan.monthly;
  const highlight = plan.highlighted;
  return (
    <div
      className="relative bg-white rounded-2xl p-6 flex flex-col"
      style={{
        border: highlight
          ? "2px solid var(--color-coral)"
          : "1px solid rgba(10,10,10,0.08)",
        boxShadow: highlight
          ? "0 20px 50px -25px rgba(255,107,74,0.45)"
          : "0 12px 30px -20px rgba(10,10,10,0.1)",
      }}
    >
      {highlight && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold text-paper"
          style={{ background: "var(--color-coral)" }}
        >
          Most popular
        </span>
      )}

      <div className="font-serif text-3xl" style={{ fontWeight: 700 }}>
        {plan.name}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold">${price}</span>
        <span className="text-sm text-mute">
          {plan.id === "send" ? "" : "/mo"}
        </span>
      </div>
      <div className="text-xs text-mute mt-1">
        {plan.id !== "send" && annual ? "billed yearly · " : ""}
        {plan.blurb}
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
              style={{
                background: highlight
                  ? "var(--color-coral)"
                  : "var(--color-iris)",
              }}
              aria-hidden
            >
              <Check
                size={10}
                strokeWidth={3}
                color={highlight ? "#fff" : "#6b3fa0"}
              />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signin"
        className="mt-6 h-11 rounded-full text-sm font-semibold inline-flex items-center justify-center transition-colors"
        style={{
          background: highlight ? "var(--color-coral)" : "var(--color-paper)",
          color: highlight ? "var(--color-paper)" : "var(--color-ink)",
          border: highlight
            ? "none"
            : "1.5px solid rgba(10,10,10,0.12)",
        }}
      >
        Start free
      </Link>
    </div>
  );
}
