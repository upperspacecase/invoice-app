"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Globe,
  Send,
} from "lucide-react";
import { CURRENCIES, formatMoney, symbolFor } from "@/lib/currency";
import { chasePlanDates, formatChaseDate } from "@/lib/followup-cadence";
import type { Business, Client, CurrencyCode } from "@/lib/types";
import { createInvoiceAction } from "@/app/_actions";

type Draft = {
  client: Client | null;
  amount: string;
  description: string;
  currency: CurrencyCode;
};

type Step = 0 | 1 | 2 | 3;

export function NewInvoiceWizard({
  business,
  clients,
  agentActive,
}: {
  business: Business;
  clients: Client[];
  agentActive: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<Draft>({
    client: null,
    amount: "",
    description: "",
    currency: business.currency,
  });
  const [showCurrency, setShowCurrency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [sentInvoiceId, setSentInvoiceId] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<number | null>(null);

  function handleBack() {
    if (step === 0 || step === 3) {
      router.push("/app");
      return;
    }
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  function pickClient(client: Client) {
    setDraft((d) => ({
      ...d,
      client,
      amount: d.amount || (client.lastAmount ? client.lastAmount.toString() : ""),
      currency: client.currency || d.currency,
    }));
    setStep(1);
  }

  function handleSend() {
    if (!draft.client) return;
    const amount = parseFloat(draft.amount || "0");
    if (!Number.isFinite(amount) || amount <= 0) return;
    setError(null);
    startTransition(async () => {
      try {
        const inv = await createInvoiceAction({
          clientId: draft.client!.id,
          amount,
          description: draft.description || "Services rendered",
          currency: draft.currency,
        });
        setSentInvoiceId(inv.id);
        setSentAt(Date.now());
        setStep(3);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
      }
    });
  }

  return (
    <div className="pt-8 relative">
      <div className="flex items-center justify-between mb-10">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === step ? 28 : 10,
                background:
                  i <= step ? "var(--color-ink)" : "var(--color-rule)",
              }}
            />
          ))}
        </div>
        <div className="w-9" />
      </div>

      {step === 0 && <StepPickClient clients={clients} onPick={pickClient} />}

      {step === 1 && draft.client && (
        <StepAmount
          draft={draft}
          setDraft={setDraft}
          onPickCurrency={() => setShowCurrency(true)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && draft.client && (
        <StepPreview
          draft={draft}
          business={business}
          pending={pending}
          error={error}
          onSend={handleSend}
        />
      )}

      {step === 3 && draft.client && (
        <StepSent
          amount={parseFloat(draft.amount || "0")}
          currency={draft.currency}
          clientName={draft.client.name}
          agentActive={agentActive}
          sentAt={sentAt ?? 0}
          invoiceId={sentInvoiceId}
          onDone={() => router.push("/app")}
        />
      )}

      {showCurrency && (
        <CurrencyPickerSheet
          selected={draft.currency}
          onPick={(c) => {
            setDraft((d) => ({ ...d, currency: c }));
            setShowCurrency(false);
          }}
          onClose={() => setShowCurrency(false)}
        />
      )}
    </div>
  );
}

function StepPickClient({
  clients,
  onPick,
}: {
  clients: Client[];
  onPick: (c: Client) => void;
}) {
  return (
    <div>
      <h1
        className="font-display text-4xl sm:text-5xl leading-tight tracking-tight"
        style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
      >
        Who&apos;s it for?
      </h1>
      <p className="text-sm text-mute mt-2 mb-8">
        Pick a saved client to continue.
      </p>
      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c)}
              className="w-full p-4 rounded-xl bg-card border border-rule flex items-center justify-between hover:border-ink/30 transition-colors text-left"
            >
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-mute mt-0.5">{c.email}</div>
              </div>
              <ChevronRight size={16} className="text-ink/40" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepAmount({
  draft,
  setDraft,
  onPickCurrency,
  onNext,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  onPickCurrency: () => void;
  onNext: () => void;
}) {
  const valid = draft.amount.length > 0 && parseFloat(draft.amount) > 0;
  const symbol = symbolFor(draft.currency);

  return (
    <div>
      <h1
        className="font-display text-4xl sm:text-5xl leading-tight tracking-tight"
        style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
      >
        How much?
      </h1>
      <p className="text-sm text-mute mt-2 mb-8">
        For {draft.client?.name}
      </p>

      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="font-mono text-5xl text-ink/70"
          style={{ fontWeight: 300 }}
        >
          {symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={draft.amount}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              amount: e.target.value.replace(/[^0-9.]/g, ""),
            }))
          }
          placeholder="0"
          autoFocus
          className="font-mono text-6xl bg-transparent outline-none flex-1 min-w-0"
          style={{ fontWeight: 300 }}
        />
      </div>

      <div className="flex items-center gap-2 mb-10">
        <button
          type="button"
          onClick={onPickCurrency}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-rule text-sm transition-colors"
          style={{ borderColor: "var(--color-rule)" }}
        >
          <Globe size={14} />
          <span className="font-mono">{draft.currency}</span>
          <span className="text-xs text-mute">· change</span>
        </button>
      </div>

      <div className="text-xs uppercase tracking-widest text-mute mb-2">
        For
      </div>
      <input
        type="text"
        value={draft.description}
        onChange={(e) =>
          setDraft((d) => ({ ...d, description: e.target.value }))
        }
        placeholder="e.g. Strategy session, April"
        className="w-full bg-transparent outline-none border-b border-rule pb-2 text-base focus:border-ink/40"
      />

      <button
        type="button"
        onClick={onNext}
        disabled={!valid}
        className="mt-12 w-full h-14 bg-ink text-paper flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Preview
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function StepPreview({
  draft,
  business,
  pending,
  error,
  onSend,
}: {
  draft: Draft;
  business: Business;
  pending: boolean;
  error: string | null;
  onSend: () => void;
}) {
  const amount = parseFloat(draft.amount || "0");

  return (
    <div>
      <h1
        className="font-display text-4xl sm:text-5xl leading-tight tracking-tight"
        style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
      >
        Looks good?
      </h1>

      <div
        className="mt-3 mb-6 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{ background: "rgba(10,10,10,0.05)", color: "var(--color-ink)" }}
      >
        <span
          aria-hidden
          className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold"
          style={{ background: "#0a0a0a", color: "#fff" }}
        >
          @
        </span>
        Will email this to {draft.client?.email}
      </div>

      <div className="bg-card border border-rule rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-mute">
              Invoice
            </div>
            <div className="font-mono text-lg mt-1">DRAFT</div>
          </div>
          <div className="text-xs text-mute">Due in 14 days</div>
        </div>

        <Block label="From">
          {business.name}
          <div className="text-mute text-sm">{business.email}</div>
        </Block>

        <Block label="To">
          {draft.client?.name}
          <div className="text-mute text-sm">{draft.client?.email}</div>
        </Block>

        <div className="border-t border-b border-rule py-3 my-4 flex justify-between items-center">
          <span className="text-sm">
            {draft.description || "Services rendered"}
          </span>
          <span className="text-sm font-mono">
            {formatMoney(amount, draft.currency)}
          </span>
        </div>

        <div className="flex justify-between items-baseline mt-4">
          <span className="text-xs uppercase tracking-widest text-mute">
            Total
          </span>
          <span className="font-mono text-2xl">
            {formatMoney(amount, draft.currency, { withCode: true })}
          </span>
        </div>

        <div className="mt-5 pt-3 border-t border-rule text-xs text-mute">
          Pay via: {business.payment}
        </div>
      </div>

      {error && (
        <div className="mt-4 text-xs text-danger">{error}</div>
      )}

      <button
        type="button"
        onClick={onSend}
        disabled={pending}
        className="mt-8 w-full h-14 bg-ink text-paper flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
      >
        <Send size={14} />
        {pending ? "Sending…" : "Send invoice"}
      </button>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-widest text-mute mb-1">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function StepSent({
  amount,
  currency,
  clientName,
  agentActive,
  sentAt,
  invoiceId,
  onDone,
}: {
  amount: number;
  currency: CurrencyCode;
  clientName: string;
  agentActive: boolean;
  sentAt: number;
  invoiceId: string | null;
  onDone: () => void;
}) {
  const plan = chasePlanDates(sentAt);
  const planRows: { label: string; at: number }[] = [
    { label: "Polite nudge", at: plan[0] },
    { label: "Firm follow-up", at: plan[1] },
    { label: "Final notice", at: plan[2] },
  ];
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-20 text-center">
      <Image
        src="/brand/nudge-mascot.jpeg"
        alt="Nudge, your invoicing assistant"
        width={160}
        height={160}
        className="rounded-3xl mb-6"
      />
      <h1
        className="font-display text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 800 }}
      >
        {agentActive ? "Sent it. I'll chase 'em." : "Sent it."}
      </h1>
      <p className="text-sm text-mute mt-3 mb-8 max-w-xs">
        {formatMoney(amount, currency)} requested from {clientName}
      </p>

      {agentActive && (
        <div className="w-full max-w-xs text-left border border-rule bg-card mb-10">
          <div className="px-4 py-2.5 border-b border-rule text-[10px] uppercase tracking-widest text-mute font-mono">
            The plan — if it goes quiet
          </div>
          {planRows.map((row, i) => (
            <div
              key={row.label}
              className={`px-4 py-2.5 flex items-center justify-between text-sm ${
                i < planRows.length - 1 ? "border-b border-rule" : ""
              }`}
            >
              <span>{row.label}</span>
              <span className="font-mono text-xs text-mute">
                {formatChaseDate(row.at)}
              </span>
            </div>
          ))}
          <div className="px-4 py-2.5 border-t border-rule text-xs text-mute">
            I stop the moment it&apos;s paid.
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {invoiceId && (
          <a
            href={`/api/v1/invoices/${invoiceId}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-md border border-rule text-sm hover:border-ink/40"
          >
            View PDF
          </a>
        )}
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-2.5 rounded-md bg-ink/[0.06] text-sm hover:bg-ink/10 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function CurrencyPickerSheet({
  selected,
  onPick,
  onClose,
}: {
  selected: CurrencyCode;
  onPick: (c: CurrencyCode) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-paper rounded-2xl border border-rule overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-rule flex items-center justify-between">
          <h2 className="text-sm font-medium">Currency</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-mute text-xs hover:text-ink"
          >
            Close
          </button>
        </div>
        <ul>
          {CURRENCIES.map((cu) => (
            <li key={cu.code}>
              <button
                type="button"
                onClick={() => onPick(cu.code)}
                className={`w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-ink/5 transition-colors ${
                  selected === cu.code ? "bg-ink/[0.03]" : ""
                }`}
              >
                <span className="font-mono text-sm w-8">{cu.symbol}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{cu.code}</span>
                  <span className="block text-xs text-mute">{cu.name}</span>
                </span>
                {selected === cu.code && (
                  <Check size={16} strokeWidth={2.5} />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
