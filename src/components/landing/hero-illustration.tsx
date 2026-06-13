import { Check } from "lucide-react";

// The trust win: show Nudge's plan up front — what it will do and when — plus
// the tradie's exact net after fees, stated plainly. Not a nag log; a schedule
// that proves the assistant knows the terms.
const PLAN = [
  { label: "Sent with pay link", note: "", date: "12 June", done: true },
  {
    label: "Friendly reminder",
    note: "3 days before due",
    date: "27 June",
    done: false,
  },
  { label: "Follow-up", note: "if unpaid", date: "3 July", done: false },
  { label: "Firmer nudge", note: "", date: "14 July", done: false },
] as const;

export function HeroIllustration() {
  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{
          border: "1px solid var(--color-rule)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid var(--color-rule)" }}
        >
          <span className="font-mono text-xs uppercase tracking-widest font-semibold">
            Invoice #1037
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1"
            style={{ background: "var(--color-hivis)", color: "var(--color-ink)" }}
          >
            Sent
          </span>
        </div>

        <Row label="From" value="Apex Electrical" />
        <Row label="To" value="Harbour Property" />

        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-rule)" }}
        >
          <div className="text-sm font-medium">Switchboard upgrade</div>
          <div className="font-mono text-xs text-mute mt-1">
            £1,850 · Due 30 June
          </div>
        </div>

        <div className="px-5 py-4" style={{ background: "rgba(28,31,26,0.035)" }}>
          <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-3">
            Nudge&apos;s plan
          </div>
          <ul className="space-y-2.5">
            {PLAN.map((p) => (
              <li key={p.label} className="flex items-center gap-3 text-xs">
                {p.done ? (
                  <span
                    className="w-4 h-4 flex items-center justify-center text-paper shrink-0"
                    style={{ background: "var(--color-paid)" }}
                    aria-hidden
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ border: "1.5px solid var(--color-rule)" }}
                    aria-hidden
                  />
                )}
                <span className="flex-1">
                  {p.label}
                  {p.note && <span className="text-mute"> · {p.note}</span>}
                </span>
                <span className="font-mono text-mute">{p.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid var(--color-rule)" }}
        >
          <p className="text-[13px] italic text-mute leading-relaxed">
            You&apos;ll receive{" "}
            <span
              className="font-mono not-italic font-semibold"
              style={{ color: "var(--color-paid-deep)" }}
            >
              ~£1,803
            </span>{" "}
            after card fees (Stripe ~£28 · Nudge £18.50)
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="px-5 py-3 flex items-center gap-4"
      style={{ borderBottom: "1px solid var(--color-rule)" }}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-mute w-12 shrink-0">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
