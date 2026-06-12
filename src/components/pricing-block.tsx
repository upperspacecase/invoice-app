import Link from "next/link";
import { Check } from "lucide-react";

// One offer, one card. Free to send; 1% only when an invoice gets paid (free
// after £2,000/yr). Card processing is Stripe's standard rate, at cost — shown
// plainly so the tradie sees their exact net before sending.
const INCLUDED: string[] = [
  "Unlimited invoices",
  "A pay link on every invoice, paid online in one tap",
  "Reminders timed to your payment terms — patient when it should be, persistent when it has to be",
  "Polite → firm → final, every message in your name, every message you'd be happy to sign",
  "Money settles straight to your own account — Nudge never touches it",
  "Your exact net shown before you send — no fee surprises, ever",
  "1% only when an invoice gets paid · free after £2,000/yr",
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
          <span style={{ color: "var(--color-paid-deep)" }}>1%</span> when an
          invoice gets paid
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
                when an invoice
                <br />
                gets paid
              </span>
            </div>

            <p className="text-sm text-mute mt-5 leading-relaxed">
              No monthly fee. No per-seat. No subscription doing nothing in the
              background.
            </p>
            <p className="text-sm text-mute mt-3 leading-relaxed">
              Nudge takes 1% the moment money lands in your account — never
              before. Once you&apos;ve paid £2,000 in a year, the rest of the
              year is free.
            </p>

            <div
              className="p-4 mt-7"
              style={{ border: "1.5px solid var(--color-ink)" }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-1.5">
                What about card fees?
              </div>
              <div className="text-[13px] text-mute leading-relaxed">
                Stripe processes the payment and charges its standard rate
                (~1.5% + 20p for UK cards) — that goes to Stripe, not us, with
                zero markup. You see your exact net before you send anything. No
                blended rates, no surprises in your dashboard.
              </div>
              <div
                className="mt-3 pt-3 text-[13px] leading-relaxed"
                style={{ borderTop: "1.5px solid var(--color-rule)" }}
              >
                On a <span className="font-mono">£1,850</span> invoice: your
                client pays <span className="font-mono">£1,850</span> · Stripe
                takes <span className="font-mono">~£28</span> · Nudge takes{" "}
                <span className="font-mono">£18.50</span> ·{" "}
                <span
                  className="font-mono font-semibold"
                  style={{ color: "var(--color-paid-deep)" }}
                >
                  £1,803.50
                </span>{" "}
                lands in your bank — without you sending a single awkward text.
              </div>
            </div>

            <p className="text-[13px] text-mute mt-4 leading-relaxed">
              Compare that to £34/month software you have to drive yourself,
              whether you get paid or not.
            </p>

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
              No card to start · you see every fee before you send
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
