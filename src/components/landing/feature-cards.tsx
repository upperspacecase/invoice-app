import { Zap, Bell, Banknote } from "lucide-react";

const ITEMS = [
  {
    n: "01",
    icon: Zap,
    title: "Send it from your phone",
    body: "Client, job, amount — invoice out in three taps.",
  },
  {
    n: "02",
    icon: Bell,
    title: "Hand off the chasing",
    body: "Nudge follows up — polite, then firm — as your invoicing assistant.",
  },
  {
    n: "03",
    icon: Banknote,
    title: "1% to get paid",
    body: "Card or bank. The money's yours; our cut comes off the top.",
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
