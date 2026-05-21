import Link from "next/link";
import { Check } from "lucide-react";

const INCLUDED: string[] = [
  "Unlimited invoices and clients",
  "PDF + email delivery",
  "Multi-currency with live FX",
  "Stripe payment links — clients pay from the inbox",
  "Branded invoices — your color on every PDF",
  "Deliver via QuickBooks, Xero & Slack",
  "Smart follow-ups — a kind AI assistant that nudges unpaid invoices",
  "Agent API — let an AI agent send and follow up",
];

export function PricingBlock() {
  return (
    <section
      id="pricing"
      className="px-6 sm:px-10 lg:px-14 py-20 sm:py-24 border-t border-neutral-200"
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
            <p className="text-sm text-neutral-500 mt-3 max-w-xs">
              Stop chasing payments. Start receiving them.
            </p>
          </div>
          <div className="lg:justify-self-end max-w-xs text-sm text-neutral-500 lg:text-right">
            One plan. Every feature. You only pay when you get paid.
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border border-black bg-black text-white p-8 flex flex-col">
            <div className="text-sm font-medium">Everything plan</div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-mono text-6xl" style={{ fontWeight: 300 }}>
                1%
              </span>
              <span className="text-xs text-white/60">per paid invoice</span>
            </div>

            <div className="text-xs text-white/70 mt-2">
              No subscription, no monthly fee. We take 1% only when an invoice
              is paid — so it costs nothing until you do.
            </div>

            <ul className="mt-6 space-y-2 flex-1">
              {INCLUDED.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <Check
                    size={14}
                    className="mt-1 flex-shrink-0 text-white/80"
                    strokeWidth={2}
                  />
                  <span style={{ opacity: 0.9 }}>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signin"
              className="mt-6 text-sm font-medium px-4 py-2.5 rounded-md text-center bg-white text-black transition-colors hover:bg-neutral-200"
            >
              Send your first invoice — free
            </Link>

            <div className="text-[11px] mt-4 leading-relaxed pt-3 border-t border-white/15 text-white/80">
              If your client doesn&apos;t open within 24 hours, the 1% on your
              next paid invoice is on us.
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-500 mt-6 text-center">
          No card required to start. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
