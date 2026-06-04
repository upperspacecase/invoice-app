import Link from "next/link";
import { Check } from "lucide-react";

// One offer, one card. Free to send invoices; 1% only when an invoice gets
// paid (capped). Layout: anchor price + callout + two-column "what's included".
const INCLUDED: string[] = [
  "Unlimited invoices, every currency",
  "A pay link on every invoice",
  "Card or bank — your client pays their way",
  "Automatic follow-up on unpaid invoices",
  "Money lands in your bank, not ours",
  "1% only when an invoice gets paid",
  "Capped at $2,000/yr — a big month won't punish you",
  "Works on your phone, on the job",
];

export function PricingBlock() {
  return (
    <section id="pricing" className="px-6 sm:px-10 lg:px-14 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <h2
          className="font-display text-center mb-10 sm:mb-12 leading-tight tracking-tight"
          style={{
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Free to send.{" "}
          <span style={{ color: "var(--color-paid-deep)" }}>
            1% to get paid.
          </span>
        </h2>

        <div
          className="rounded-[28px] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-10 lg:gap-14 p-7 sm:p-10 lg:p-12"
          style={{
            background: "var(--color-card)",
            border: "1.5px solid var(--color-rule)",
            boxShadow: "0 28px 60px -34px rgba(28,31,26,0.28)",
          }}
        >
          {/* Left: the offer */}
          <div className="flex flex-col">
            <span
              className="inline-flex self-start items-center text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
              style={{
                color: "var(--color-paid-deep)",
                background: "rgba(46,184,106,0.12)",
              }}
            >
              For tradies who hate chasing
            </span>

            <div
              className="font-display leading-none"
              style={{ fontWeight: 800, fontSize: "clamp(2.5rem,6vw,3.5rem)" }}
            >
              Free <span style={{ color: "var(--color-mute)" }}>+</span>{" "}
              <span style={{ color: "var(--color-paid-deep)" }}>1%</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2.5">
              <span
                className="font-mono text-lg line-through"
                style={{ color: "var(--color-mute)" }}
              >
                $29/mo
              </span>
              <span className="font-mono text-2xl" style={{ fontWeight: 500 }}>
                $0
              </span>
              <span className="text-sm text-mute">monthly · forever</span>
            </div>
            <div className="text-sm text-mute mt-1">
              then just <span className="font-mono">1%</span> when an invoice
              gets paid — capped at $2,000 a year.
            </div>

            <div
              className="rounded-2xl p-4 mt-7"
              style={{
                background: "rgba(46,184,106,0.08)",
                border: "1px solid rgba(46,184,106,0.22)",
              }}
            >
              <div className="text-sm font-semibold">
                You only pay when it works.
              </div>
              <div className="text-[13px] text-mute mt-1 leading-relaxed">
                No monthly fee, no lock-in. Nudge takes 1% of an invoice only
                when the money actually lands in your account.
              </div>
            </div>

            <Link
              href="/signin"
              className="mt-7 inline-flex items-center justify-center gap-2 h-14 rounded-2xl text-base font-semibold text-paper transition-transform hover:scale-[1.01]"
              style={{ background: "var(--color-paid)" }}
            >
              Start free <span aria-hidden>→</span>
            </Link>
            <div className="text-xs text-mute text-center mt-3">
              No card to start. Set up in minutes.
            </div>
          </div>

          {/* Right: what's included */}
          <div className="lg:border-l lg:pl-14" style={{ borderColor: "var(--color-rule)" }}>
            <div className="text-base font-semibold mb-5">
              What&apos;s included:
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-snug">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--color-paid)" }}
                    aria-hidden
                  >
                    <Check size={12} strokeWidth={3} color="#fff" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
