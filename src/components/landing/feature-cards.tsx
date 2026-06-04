import { Zap, Bell, TrendingUp } from "lucide-react";

const ITEMS = [
  {
    icon: Zap,
    iconBg: "rgba(46,184,106,0.14)",
    iconColor: "var(--color-paid-deep)",
    title: "Send it from your phone",
    body: "Client, job, amount — invoice out in seconds.",
    squiggle: "var(--color-paid)",
  },
  {
    icon: Bell,
    iconBg: "rgba(212,242,60,0.30)",
    iconColor: "#5f6b12",
    title: "Hand off the chasing",
    body: "Nudge follows up with your client — kindly, as your invoicing assistant.",
    squiggle: "#9aa92a",
  },
  {
    icon: TrendingUp,
    iconBg: "rgba(46,184,106,0.14)",
    iconColor: "var(--color-paid-deep)",
    title: "1% to get paid",
    body: "Card or bank. The money's yours — our cut comes off the top.",
    squiggle: "var(--color-paid)",
  },
] as const;

export function FeatureCards() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-16 sm:pb-20">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-4 sm:gap-5">
        {ITEMS.map((it) => (
          <FeatureCard key={it.title} {...it} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  body,
  squiggle,
}: (typeof ITEMS)[number]) {
  return (
    <div
      className="bg-white rounded-2xl p-6 relative"
      style={{
        border: "1px solid rgba(10,10,10,0.06)",
        boxShadow: "0 12px 30px -20px rgba(10,10,10,0.12)",
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
        style={{ background: iconBg, color: iconColor }}
        aria-hidden
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="text-base font-semibold mb-1">{title}</div>
      <div className="text-sm text-mute leading-relaxed">{body}</div>
      <Squiggle color={squiggle} />
    </div>
  );
}

function Squiggle({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      width="60"
      height="14"
      viewBox="0 0 60 14"
      className="absolute"
      style={{ bottom: 12, right: 18 }}
    >
      <path
        d="M 2 8 Q 12 -2, 22 8 T 42 8 T 58 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}
