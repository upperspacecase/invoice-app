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
      {/* decorative yellow dots cluster */}
      <Dots top={100} left={60} color="var(--color-sun)" />

      {/* sky-blue organic blob */}
      <div
        aria-hidden
        className="absolute hidden md:block"
        style={{
          right: -30,
          top: 140,
          width: 180,
          height: 140,
          borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
          background: "var(--color-sky)",
          opacity: 0.55,
          zIndex: 0,
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-9">
          <h2
            className="font-serif leading-tight tracking-tight"
            style={{
              fontWeight: 700,
              fontSize: "clamp(2rem, 4.5vw, 2.75rem)",
              letterSpacing: "-0.01em",
            }}
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
                boxShadow: !annual ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
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

        <div className="grid md:grid-cols-3 gap-5">
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
      className="relative bg-white flex flex-col"
      style={{
        borderRadius: 20,
        padding: 28,
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
          className="absolute font-semibold text-paper"
          style={{
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 16px",
            borderRadius: 999,
            fontSize: 12,
            background: "var(--color-coral)",
          }}
        >
          Most popular
        </span>
      )}

      <div
        className="font-serif"
        style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}
      >
        {plan.name}
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span
          className="font-serif"
          style={{ fontSize: 30, fontWeight: 700 }}
        >
          ${price}
        </span>
        <span className="text-sm text-mute">
          {plan.id === "send" ? "" : "/mo"}
        </span>
      </div>
      <div className="text-xs text-mute mt-1">
        {plan.id !== "send" && annual ? "billed yearly · " : ""}
        {plan.blurb}
      </div>

      <div
        className="my-5"
        style={{ height: 1, background: "rgba(10,10,10,0.08)" }}
      />

      <ul className="flex flex-col gap-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm">
            <span
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
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
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/signin"
        className="mt-6 inline-flex items-center justify-center text-sm font-semibold transition-colors"
        style={{
          height: 46,
          borderRadius: 10,
          background: highlight ? "var(--color-coral)" : "var(--color-paper)",
          color: highlight ? "var(--color-paper)" : "var(--color-ink)",
          border: highlight ? "none" : "1.5px solid rgba(10,10,10,0.15)",
        }}
      >
        Start free
      </Link>
    </div>
  );
}

function Dots({
  top,
  left,
  color,
}: {
  top: number;
  left: number;
  color: string;
}) {
  return (
    <svg
      aria-hidden
      width="60"
      height="50"
      viewBox="0 0 60 50"
      className="absolute hidden md:block"
      style={{ top, left, opacity: 0.6, zIndex: 0 }}
    >
      {[...Array(20)].map((_, i) => {
        const x = (i % 5) * 12 + 4;
        const y = Math.floor(i / 5) * 12 + 4;
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}
