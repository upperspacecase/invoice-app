"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { followupBody } from "@/lib/followup-templates";
import type { FollowupStage } from "@/lib/types";

// Clickable demo of the real flow. Click through: send -> Nudge chases (showing
// the actual staged messages it sends) -> paid, with the 1% taken off the top.
const BUSINESS = "Apex Electrical";
const CLIENT = "Harbour Property";
const CLIENT_FIRST = "Harbour";
const INVOICE_ID = "#1037";
const TOTAL = "$1,850.00";

type Step = 0 | 1 | 2 | 3 | 4;

const CTA: Record<Step, string> = {
  0: "Send invoice",
  1: "▶ 7 days later — still unpaid",
  2: "▶ 14 days — still unpaid",
  3: "▶ Client pays",
  4: "↻ Replay demo",
};

export function HeroIllustration() {
  const [step, setStep] = useState<Step>(0);
  const next = () =>
    setStep((s) => (s === 4 ? 0 : ((s + 1) as Step)));

  const status = step === 0 ? "Draft" : step === 4 ? "Paid" : "Sent";
  const statusBg =
    step === 4
      ? "var(--color-paid)"
      : step === 0
      ? "transparent"
      : "var(--color-hivis)";

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
            Invoice {INVOICE_ID}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1"
            style={{
              background: statusBg,
              color: step === 4 ? "var(--color-paper)" : "var(--color-ink)",
              border: step === 0 ? "1px solid var(--color-rule)" : "none",
            }}
          >
            {status}
          </span>
        </div>

        <Row label="From" value={BUSINESS} />
        <Row label="To" value={CLIENT} />
        <Row label="Work" value="Switchboard upgrade" />

        <div
          className="px-5 py-4 flex items-end justify-between"
          style={{ borderBottom: "1.5px solid var(--color-ink)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
            Amount {step === 4 ? "paid" : "due"}
          </span>
          <span
            className="font-mono text-3xl"
            style={{
              fontWeight: 600,
              color: step === 4 ? "var(--color-paid-deep)" : "inherit",
            }}
          >
            {TOTAL}
          </span>
        </div>

        <div
          className="px-5 py-4"
          style={{ background: "rgba(28,31,26,0.035)", minHeight: 128 }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-3">
            Follow-up log
          </div>
          {step === 0 && (
            <p className="text-xs text-mute leading-relaxed">
              Hand Nudge the invoice and it watches for payment — then chases
              the client politely, firmly, finally, until it&apos;s paid.
            </p>
          )}
          {step >= 1 && <LogRow day="00" label="Sent · Nudge watching" done />}
          {step >= 2 && <LogRow day="07" label="Polite nudge sent" done />}
          {step >= 3 && <LogRow day="14" label="Firm reminder sent" done />}
          {step >= 4 && <LogRow day="16" label="Paid" amount={TOTAL} />}
          {step === 4 && (
            <div className="font-mono text-[11px] mt-2 text-mute">
              Nudge&apos;s 1%:{" "}
              <span style={{ color: "var(--color-ink)" }}>$18.50</span> · the
              rest is yours
            </div>
          )}
        </div>

        {(step === 2 || step === 3) && (
          <MessagePreview stage={(step === 2 ? 1 : 2) as FollowupStage} />
        )}

        <div className="p-4" style={{ borderTop: "1.5px solid var(--color-ink)" }}>
          <button
            type="button"
            onClick={next}
            className="w-full h-12 text-sm font-bold uppercase tracking-widest transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            style={
              step === 0
                ? {
                    background: "var(--color-paid)",
                    color: "var(--color-paper)",
                    boxShadow: "4px 4px 0 var(--color-ink)",
                  }
                : step === 4
                ? {
                    border: "1.5px solid var(--color-ink)",
                    background: "transparent",
                  }
                : {
                    background: "var(--color-ink)",
                    color: "var(--color-paper)",
                  }
            }
          >
            {CTA[step]}
          </button>
          <div className="font-mono text-[10px] uppercase tracking-widest text-mute text-center mt-2.5">
            {step === 0
              ? "Click — this is the real flow"
              : step === 4
              ? "That's it — you got paid"
              : "Live demo · the actual messages Nudge sends"}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagePreview({ stage }: { stage: FollowupStage }) {
  const body = followupBody({
    businessName: BUSINESS,
    clientFirst: CLIENT_FIRST,
    invoiceId: INVOICE_ID,
    total: TOTAL,
    stage,
  });
  return (
    <div
      className="px-5 py-4 bg-card"
      style={{ borderTop: "1.5px solid var(--color-ink)" }}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-mute mb-2">
        Email to {CLIENT} · {stage === 1 ? "polite" : "firm"}
      </div>
      <p className="text-[13px] leading-relaxed whitespace-pre-line">{body}</p>
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
          +{amount}
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
