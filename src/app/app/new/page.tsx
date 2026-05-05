"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Send,
  Check,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import type { Client } from "@/lib/demo-data";

type Draft = {
  client: Client | null;
  amount: string;
  description: string;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const { business, clients, addInvoice } = useDemo();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [draft, setDraft] = useState<Draft>({
    client: null,
    amount: "",
    description: "",
  });

  function handleBack() {
    if (step === 0 || step === 3) {
      router.push("/app");
      return;
    }
    setStep((s) => Math.max(0, s - 1) as 0 | 1 | 2 | 3);
  }

  function pickClient(client: Client) {
    setDraft((d) => ({
      ...d,
      client,
      amount: d.amount || client.lastAmount.toString(),
    }));
    setStep(1);
  }

  function handleSend() {
    if (!draft.client) return;
    const amount = parseFloat(draft.amount || "0");
    if (!Number.isFinite(amount) || amount <= 0) return;
    addInvoice({
      clientId: draft.client.id,
      amount,
      description: draft.description || "Services rendered",
    });
    setStep(3);
  }

  return (
    <div className="pt-8">
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

      {step === 0 && (
        <StepPickClient clients={clients} onPick={pickClient} />
      )}

      {step === 1 && draft.client && (
        <StepAmount
          draft={draft}
          setDraft={setDraft}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && draft.client && (
        <StepPreview
          draft={draft}
          businessName={business.name}
          businessEmail={business.email}
          businessPayment={business.payment}
          onSend={handleSend}
        />
      )}

      {step === 3 && draft.client && (
        <StepSent
          amount={parseFloat(draft.amount || "0")}
          clientName={draft.client.name}
          onDone={() => router.push("/app")}
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
        className="font-serif text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 400, fontStyle: "italic" }}
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
  onNext,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  onNext: () => void;
}) {
  const valid =
    draft.amount.length > 0 && parseFloat(draft.amount) > 0;

  return (
    <div>
      <h1
        className="font-serif text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 400, fontStyle: "italic" }}
      >
        How much?
      </h1>
      <p className="text-sm text-mute mt-2 mb-10">
        For {draft.client?.name}
      </p>

      <div className="flex items-baseline gap-2 mb-10">
        <span
          className="font-mono text-5xl text-ink/70"
          style={{ fontWeight: 300 }}
        >
          $
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
        className="mt-12 w-full h-14 rounded-xl bg-ink text-paper flex items-center justify-center gap-2 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Preview
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function StepPreview({
  draft,
  businessName,
  businessEmail,
  businessPayment,
  onSend,
}: {
  draft: Draft;
  businessName: string;
  businessEmail: string;
  businessPayment: string;
  onSend: () => void;
}) {
  const amount = parseFloat(draft.amount || "0");

  return (
    <div>
      <h1
        className="font-serif text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 400, fontStyle: "italic" }}
      >
        Looks good?
      </h1>
      <p className="text-sm text-mute mt-2 mb-8">
        We&apos;ll email this to {draft.client?.email}
      </p>

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
          {businessName}
          <div className="text-mute text-sm">{businessEmail}</div>
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
            ${amount.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-baseline mt-4">
          <span className="text-xs uppercase tracking-widest text-mute">
            Total
          </span>
          <span className="font-mono text-2xl">
            ${amount.toLocaleString()}
          </span>
        </div>

        <div className="mt-5 pt-3 border-t border-rule text-xs text-mute">
          Pay via: {businessPayment}
        </div>
      </div>

      <button
        type="button"
        onClick={onSend}
        className="mt-8 w-full h-14 rounded-xl bg-ink text-paper flex items-center justify-center gap-2 text-sm font-medium hover:bg-ink/90 transition-colors"
      >
        <Send size={14} />
        Send to {draft.client?.email.split("@")[0]}
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
  clientName,
  onDone,
}: {
  amount: number;
  clientName: string;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-20 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-paper"
        style={{ background: "var(--color-paid)" }}
      >
        <Check size={32} strokeWidth={2.5} />
      </div>
      <h1
        className="font-serif text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 400, fontStyle: "italic" }}
      >
        Sent.
      </h1>
      <p className="text-sm text-mute mt-3 mb-10">
        ${amount.toLocaleString()} requested from {clientName}
      </p>
      <button
        type="button"
        onClick={onDone}
        className="px-7 py-3 rounded-md bg-ink/[0.06] text-sm hover:bg-ink/10 transition-colors"
      >
        Done
      </button>
    </div>
  );
}
