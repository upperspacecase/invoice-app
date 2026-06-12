import { Zap, Bell, Banknote } from "lucide-react";

const ITEMS = [
  {
    n: "01",
    icon: Zap,
    title: "Send it from your phone",
    body: "Client, job, amount, payment terms. Invoice out in three taps, pay link included.",
  },
  {
    n: "02",
    icon: Bell,
    title: "Nudge takes the watch",
    body: "It knows when the invoice is due and what normal looks like. A friendly reminder before the due date, a polite follow-up after, firmer only if it's earned. Every message sounds like you on your most professional day — never desperate, never rude.",
  },
  {
    n: "03",
    icon: Banknote,
    title: "Money lands in your bank",
    body: "Straight into your own account — Nudge never holds it. Standard card fees go to Stripe at cost; Nudge takes 1% only when the invoice is paid.",
  },
] as const;

export function FeatureCards() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-16 sm:pb-20">
      <div
        className="max-w-6xl mx-auto grid sm:grid-cols-3"
        style={{ border: "1.5px solid var(--color-ink)" }}
      >
        {ITEMS.map((it, i) => (
          <FeatureCard key={it.n} {...it} last={i === ITEMS.length - 1} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  n,
  icon: Icon,
  title,
  body,
  last,
}: (typeof ITEMS)[number] & { last: boolean }) {
  return (
    <div
      className={`p-6 sm:p-8 ${
        last ? "" : "border-b-[1.5px] sm:border-b-0 sm:border-r-[1.5px]"
      }`}
      style={last ? undefined : { borderColor: "var(--color-ink)" }}
    >
      <div className="flex items-center justify-between mb-7">
        <span className="font-mono text-xs uppercase tracking-widest text-mute">
          {n}
        </span>
        <span
          className="w-9 h-9 flex items-center justify-center"
          style={{ border: "1.5px solid var(--color-ink)" }}
          aria-hidden
        >
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <div className="font-display text-lg mb-1.5" style={{ fontWeight: 700 }}>
        {title}
      </div>
      <div className="text-sm text-mute leading-relaxed">{body}</div>
    </div>
  );
}
