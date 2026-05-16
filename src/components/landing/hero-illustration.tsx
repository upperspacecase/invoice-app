import { Check, Bell } from "lucide-react";

// Phone-style invoice card on the left, paper plane + dashed trail above,
// status timeline floating on the right. Decorative blobs (yellow sun,
// mint leaf-blob, dots, blue squiggle) sit behind. On smaller widths the
// timeline collapses into a vertical stack below the phone.
export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto" style={{ paddingTop: 20 }}>
      {/* sun blob */}
      <div
        aria-hidden
        className="absolute"
        style={{
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "var(--color-sun)",
          top: 0,
          left: -10,
          opacity: 0.65,
          zIndex: 0,
        }}
      />
      {/* mint leaf-blob (organic shape, rotated) */}
      <div
        aria-hidden
        className="absolute hidden sm:block"
        style={{
          width: 140,
          height: 90,
          borderRadius: "60% 40% 50% 50% / 60% 50% 50% 40%",
          background: "var(--color-mint)",
          bottom: 30,
          right: -40,
          opacity: 0.75,
          zIndex: 0,
          transform: "rotate(-12deg)",
        }}
      />
      {/* dotted cluster top-right */}
      <Dots top={60} right={-20} color="var(--color-coral-soft)" />

      {/* paper plane top-right */}
      <svg
        aria-hidden
        width="110"
        height="90"
        viewBox="0 0 110 90"
        className="absolute"
        style={{ top: -20, right: 30, zIndex: 3 }}
      >
        <path
          d="M 95 8 L 8 38 L 38 50 L 52 78 Z"
          fill="var(--color-coral)"
          stroke="var(--color-coral-deep)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M 38 50 L 95 8 L 52 78 Z"
          fill="var(--color-coral-deep)"
          opacity="0.4"
        />
        <path
          d="M 38 50 L 60 42"
          stroke="#fff"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* dashed trail from phone toward the plane */}
      <svg
        aria-hidden
        width="180"
        height="160"
        viewBox="0 0 180 160"
        className="absolute hidden sm:block"
        style={{ top: 30, right: 60, zIndex: 2 }}
      >
        <path
          d="M 30 130 C 40 90, 70 60, 110 40"
          stroke="rgba(10,10,10,0.35)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* small blue squiggle */}
      <svg
        aria-hidden
        width="40"
        height="30"
        viewBox="0 0 40 30"
        className="absolute hidden sm:block"
        style={{ top: 230, right: -30, zIndex: 1, color: "#5a8de8" }}
      >
        <path
          d="M 4 22 Q 10 6, 18 16 T 36 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* phone-style invoice card */}
      <div
        className="relative bg-white"
        style={{
          borderRadius: 24,
          padding: 28,
          border: "1px solid rgba(10,10,10,0.06)",
          boxShadow:
            "0 30px 60px -30px rgba(10,10,10,0.18), 0 12px 24px -12px rgba(10,10,10,0.08)",
          maxWidth: 360,
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600 }}>Invoice #1037</div>

        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-mute w-10 shrink-0">From</span>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ background: "#6b8cff" }}
              aria-hidden
            >
              DS
            </span>
            <span className="text-sm">Design Studio</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-mute w-10 shrink-0">To</span>
            <span className="text-sm">Acme Co.</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="font-serif text-3xl" style={{ fontWeight: 600 }}>
            $1,250.00
          </div>
          <div className="text-xs text-mute mt-1">Due Apr 30, 2026</div>
        </div>

        <span
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium"
          style={{
            background: "rgba(45,122,79,0.14)",
            color: "var(--color-paid)",
            padding: "6px 12px",
            borderRadius: 8,
          }}
        >
          <span
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--color-paid)" }}
            aria-hidden
          >
            <Check size={9} strokeWidth={3} />
          </span>
          Sent
        </span>

        <button
          type="button"
          aria-label="View invoice (preview)"
          tabIndex={-1}
          className="mt-5 w-full h-11 rounded-xl bg-ink text-paper text-sm font-medium pointer-events-none"
        >
          View invoice
        </button>

        <div className="mt-3 text-center">
          <span className="text-xs text-mute inline-flex items-center gap-1">
            <LinkIcon />
            Copy payment link
          </span>
        </div>
      </div>

      {/* status timeline — desktop only, absolute right */}
      <div
        aria-hidden
        className="hidden lg:block absolute"
        style={{ right: "-110px", top: "50px", width: 220, zIndex: 2 }}
      >
        <TimelineCard
          icon={<PaperPlaneIcon />}
          iconBg="#cfe4ff"
          iconColor="#1e6fbb"
          title="Sent"
          time="Apr 16, 9:42 AM"
        />
        <DashedConnector />
        <TimelineCard
          icon={<Bell size={14} strokeWidth={2.2} />}
          iconBg="#fde68a"
          iconColor="#a06b00"
          title="Reminder sent"
          time="Apr 23, 9:00 AM"
          subline="Friendly nudge"
        />
        <DashedConnector />
        <TimelineCard
          icon={<Check size={14} strokeWidth={3} />}
          iconBg="#bef0d0"
          iconColor="#1e6f3a"
          title="Paid"
          time="Apr 24, 2:31 PM"
          accent="$1,250.00"
        />
      </div>

      {/* mobile/tablet inline timeline */}
      <div className="lg:hidden mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TimelineCard
          icon={<PaperPlaneIcon />}
          iconBg="#cfe4ff"
          iconColor="#1e6fbb"
          title="Sent"
          time="Apr 16, 9:42 AM"
        />
        <TimelineCard
          icon={<Bell size={14} strokeWidth={2.2} />}
          iconBg="#fde68a"
          iconColor="#a06b00"
          title="Reminder sent"
          time="Apr 23, 9:00 AM"
          subline="Friendly nudge"
        />
        <TimelineCard
          icon={<Check size={14} strokeWidth={3} />}
          iconBg="#bef0d0"
          iconColor="#1e6f3a"
          title="Paid"
          time="Apr 24, 2:31 PM"
          accent="$1,250.00"
        />
      </div>
    </div>
  );
}

function TimelineCard({
  icon,
  iconBg,
  iconColor,
  title,
  time,
  subline,
  accent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  time: string;
  subline?: string;
  accent?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl p-3 flex items-start gap-2.5"
      style={{
        border: "1px solid rgba(10,10,10,0.06)",
        boxShadow: "0 8px 20px -10px rgba(10,10,10,0.12)",
      }}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold">{title}</div>
        <div className="text-[11px] text-mute">{time}</div>
        {subline && <div className="text-[11px] text-mute mt-0.5">{subline}</div>}
        {accent && (
          <div
            className="text-sm font-semibold mt-1"
            style={{ color: "var(--color-paid)" }}
          >
            {accent}
          </div>
        )}
      </div>
    </div>
  );
}

function DashedConnector() {
  return (
    <svg
      aria-hidden
      width="100%"
      height="22"
      viewBox="0 0 220 22"
      className="opacity-50"
    >
      <path
        d="M 30 0 C 50 10, 80 22, 110 16 S 180 8, 200 22"
        stroke="rgba(10,10,10,0.35)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        fill="none"
      />
    </svg>
  );
}

function PaperPlaneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M15 1 1 6.5l5 1.4 1.4 5L15 1Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
      <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
    </svg>
  );
}

function Dots({
  top,
  right,
  color,
}: {
  top: number;
  right: number;
  color: string;
}) {
  return (
    <svg
      aria-hidden
      width="60"
      height="50"
      viewBox="0 0 60 50"
      className="absolute"
      style={{ top, right, zIndex: 0 }}
    >
      {[...Array(20)].map((_, i) => {
        const x = (i % 5) * 12 + 4;
        const y = Math.floor(i / 5) * 12 + 4;
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}
