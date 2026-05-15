import { Zap, Bell, TrendingUp } from "lucide-react";

const ITEMS = [
  {
    icon: Zap,
    iconBg: "#e9d8fd",
    iconColor: "#6b3fa0",
    title: "Create in seconds",
    body: "Client, amount, due date, done.",
    squiggle: "#6b3fa0",
  },
  {
    icon: Bell,
    iconBg: "#fde68a",
    iconColor: "#a06b00",
    title: "Auto-follow-up",
    body: "Friendly reminders send themselves.",
    squiggle: "#d8a020",
  },
  {
    icon: TrendingUp,
    iconBg: "#bef0d0",
    iconColor: "#1e6f3a",
    title: "Get paid faster",
    body: "Payment links and clear status tracking.",
    squiggle: "#1e6f3a",
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
