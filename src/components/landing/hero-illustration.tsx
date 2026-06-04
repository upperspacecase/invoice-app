import { Check } from "lucide-react";

// The invoice as a utilitarian work order: hard ink rules, mono labels, and
// the assistant's follow-up log underneath. No blobs, no doodles — structure.
export function HeroIllustration() {
  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      <div
        className="bg-card"
        style={{
          border: "1.5px solid var(--color-ink)",
          boxShadow: "6px 6px 0 var(--color-ink)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1.5px solid var(--color-ink)" }}
        >
          <span className="font-mono text-xs uppercase tracking-widest font-semibold">
            Invoice #1037
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1"
            style={{ background: "var(--color-hivis)" }}
          >
            Sent
          </span>
        </div>

        <Row label="From" value="Apex Electrical" />
        <Row label="To" value="Harbour Property" />
        <Row label="Work" value="Switchboard upgrade" />

        <div
          className="px-5 py-4 flex items-end justify-between"
          style={{ borderBottom: "1.5px solid var(--color-ink)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
            Amount due
          </span>
          <span className="font-mono text-3xl" style={{ fontWeight: 600 }}>
            $1,850.00
          </span>
        </div>

        <div className="px-5 py-4" style={{ background: "rgba(28,31,26,0.035)" }}>
          <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-3">
            Follow-up log
          </div>
          <LogRow day="07" label="Polite nudge" done />
          <LogRow day="14" label="Firm reminder" done />
          <LogRow day="24" label="Paid" amount="+$1,850.00" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-5 py-3 flex items-center gap-4"
      style={{ borderBottom: "1.5px solid var(--color-ink)" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-mute w-12 shrink-0">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function LogRow({
  day,
  label,
  done,
  amount,
}: {
  day: string;
  label: string;
  done?: boolean;
  amount?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 font-mono text-xs">
      <span className="text-mute w-12 shrink-0">DAY {day}</span>
      <span className="flex-1 uppercase tracking-wide">{label}</span>
      {amount ? (
        <span style={{ color: "var(--color-paid-deep)", fontWeight: 600 }}>
          {amount}
        </span>
      ) : done ? (
        <span
          className="w-4 h-4 flex items-center justify-center text-paper"
          style={{ background: "var(--color-paid)" }}
          aria-hidden
        >
          <Check size={10} strokeWidth={3} />
        </span>
      ) : null}
    </div>
  );
}
