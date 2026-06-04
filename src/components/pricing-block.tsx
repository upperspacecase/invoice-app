import Link from "next/link";
import { Check } from "lucide-react";

// One offer, one card. Free to send; 1% only when an invoice gets paid (capped
// at $2,000/yr). Utilitarian: hard ink rules, square corners, mono labels.
const INCLUDED: string[] = [
  "Unlimited invoices, every currency",
  "A pay link on every invoice",
  "Card or bank — your client pays their way",
  "Polite → firm → final follow-up, until paid",
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
          className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] bg-card"
          style={{
            border: "1.5px solid var(--color-ink)",
            boxShadow: "8px 8px 0 var(--color-ink)",
          }}
        >
          {/* Left: the offer */}
          <div
            className="p-7 sm:p-10 flex flex-col lg:border-r-[1.5px] border-b-[1.5px] lg:border-b-0"
            style={{ borderColor: "var(--color-ink)" }}
          >
            <span
              className="inline-flex self-start items-center font-mono text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1.5 mb-7"
              style={{ border: "1.5px solid var(--color-ink)" }}
            >
              For tradies who hate chasing
            </span>

            <div className="flex items-baseline gap-3">
              <span
                className="font-display leading-none"
                style={{ fontWeight: 800, fontSize: "clamp(3.5rem,8vw,5rem)" }}
              >
                1%
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-mute leading-tight">
                on invoices
                <br />
                you get paid
              </span>
            </div>

            <p className="text-sm text-mute mt-5 leading-relaxed">
              No monthly fee, no per-seat, no lock-in. We take 1% only when an
              invoice actually gets paid — capped at $2,000 a year.
            </p>

            <div
              className="p-4 mt-7"
              style={{ border: "1.5px solid var(--color-ink)" }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-1.5">
                The deal
              </div>
              <div className="text-sm font-semibold">
                You only pay when it works.
              </div>
              <div className="text-[13px] text-mute mt-1 leading-relaxed">
                Nudge takes its 1% the moment the money lands in your account —
                never before.
              </div>
            </div>

            <Link
              href="/signin"
              className="mt-7 inline-flex items-center justify-center px-8 text-paper text-sm font-bold uppercase tracking-widest transition-transform active:translate-x-[3px] active:translate-y-[3px]"
              style={{
                height: 54,
                background: "var(--color-paid)",
                boxShadow: "4px 4px 0 var(--color-ink)",
              }}
            >
              Start free
            </Link>
            <div className="font-mono text-[10px] uppercase tracking-widest text-mute text-center mt-3">
              No card to start · set up in minutes
            </div>
          </div>

          {/* Right: what's included */}
          <div className="p-7 sm:p-10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-5">
              What&apos;s included
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-snug"
                >
                  <span
                    className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5"
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
