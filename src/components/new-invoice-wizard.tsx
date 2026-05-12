"use client";

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
import { channelLabel } from "@/components/channel-icon";
import { FeatureBadge, featureStatus } from "@/components/feature-lock";
import type {
  Business,
  Client,
  CurrencyCode,
  DeliveryChannel,
  IntegrationId,
} from "@/lib/types";
import type { FeatureId } from "@/lib/features";
import { createInvoiceAction } from "@/app/_actions";

type Draft = {
  client: Client | null;
  amount: string;
  description: string;
  currency: CurrencyCode;
  channelOverride: DeliveryChannel | null;
};

type Step = 0 | 1 | 2 | 3;

export function NewInvoiceWizard({
  business,
  clients,
  connectedIntegrations,
  featureVotes,
}: {
  business: Business;
  clients: Client[];
  connectedIntegrations: IntegrationId[];
  featureVotes: FeatureId[];
}) {
  const currencyUnlocked =
    featureStatus("multi-currency", business.tier) === "allowed";
  const currencyVoted = featureVotes.includes("multi-currency");
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [draft, setDraft] = useState<Draft>({
    client: null,
    amount: "",
    description: "",
    currency: business.currency,
    channelOverride: null,
  });
  const [showCurrency, setShowCurrency] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      channelOverride: null,
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
        await createInvoiceAction({
          clientId: draft.client!.id,
          amount,
          description: draft.description || "Services rendered",
          currency: draft.currency,
          channelOverride: draft.channelOverride ?? undefined,
        });
        setStep(3);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
      }
    });
  }

  const effectiveChannel: DeliveryChannel | null = draft.client
    ? draft.channelOverride ?? draft.client.delivery
    : null;

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
          currencyUnlocked={currencyUnlocked}
          currencyVoted={currencyVoted}
          userTier={business.tier}
          onPickCurrency={() => currencyUnlocked && setShowCurrency(true)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && draft.client && (
        <StepPreview
          draft={draft}
          business={business}
          channel={effectiveChannel ?? "email"}
          connectedIntegrations={connectedIntegrations}
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
          channel={effectiveChannel ?? "email"}
          deliveryHandle={draft.client.deliveryHandle}
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
  currencyUnlocked,
  currencyVoted,
  userTier,
  onPickCurrency,
  onNext,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  currencyUnlocked: boolean;
  currencyVoted: boolean;
  userTier: Business["tier"];
  onPickCurrency: () => void;
  onNext: () => void;
}) {
  const valid = draft.amount.length > 0 && parseFloat(draft.amount) > 0;
  const symbol = symbolFor(draft.currency);

  return (
    <div>
      <h1
        className="font-serif text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 400, fontStyle: "italic" }}
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
          disabled={!currencyUnlocked}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-rule text-sm transition-colors disabled:cursor-not-allowed"
          style={{
            borderColor: "var(--color-rule)",
            opacity: currencyUnlocked ? 1 : 0.6,
          }}
        >
          <Globe size={14} />
          <span className="font-mono">{draft.currency}</span>
          {currencyUnlocked && (
            <span className="text-xs text-mute">· change</span>
          )}
        </button>
        {!currencyUnlocked && (
          <FeatureBadge
            feature="multi-currency"
            userTier={userTier}
            voted={currencyVoted}
          />
        )}
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
  business,
  channel,
  connectedIntegrations,
  pending,
  error,
  onSend,
}: {
  draft: Draft;
  business: Business;
  channel: DeliveryChannel;
  connectedIntegrations: IntegrationId[];
  pending: boolean;
  error: string | null;
  onSend: () => void;
}) {
  const amount = parseFloat(draft.amount || "0");
  const callout = channelCallout(channel, draft.client!, connectedIntegrations);

  return (
    <div>
      <h1
        className="font-serif text-4xl sm:text-5xl leading-tight"
        style={{ fontWeight: 400, fontStyle: "italic" }}
      >
        Looks good?
      </h1>

      <div
        className="mt-3 mb-6 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{
          background: callout.bg,
          color: callout.fg,
        }}
      >
        <span
          aria-hidden
          className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold"
          style={{ background: callout.swatch, color: "#fff" }}
        >
          {callout.initial}
        </span>
        {callout.text}
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
        <div className="mt-4 text-xs text-accent">{error}</div>
      )}

      <button
        type="button"
        onClick={onSend}
        disabled={pending}
        className="mt-8 w-full h-14 rounded-xl bg-ink text-paper flex items-center justify-center gap-2 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        <Send size={14} />
        {pending ? "Sending…" : `Send via ${channelLabel(channel)}`}
      </button>
    </div>
  );
}

type Callout = {
  text: string;
  bg: string;
  fg: string;
  swatch: string;
  initial: string;
};

function channelCallout(
  channel: DeliveryChannel,
  client: Client,
  connected: IntegrationId[]
): Callout {
  const handle = client.deliveryHandle ?? client.email;
  const requiresOAuth: Record<DeliveryChannel, IntegrationId | null> = {
    email: null,
    portal: null,
    quickbooks: "quickbooks",
    xero: "xero",
    slack: "slack",
    webhook: "webhook",
  };
  const needs = requiresOAuth[channel];
  const ok = !needs || connected.includes(needs);
  if (!ok) {
    return {
      text: `${channelLabel(channel)} not connected — will fall back to email`,
      bg: "rgba(196, 78, 44, 0.08)",
      fg: "#a73e22",
      swatch: "#c44e2c",
      initial: "!",
    };
  }
  if (channel === "email") {
    return {
      text: `Will email this to ${client.email}`,
      bg: "rgba(10,10,10,0.05)",
      fg: "var(--color-ink)",
      swatch: "#0a0a0a",
      initial: "@",
    };
  }
  return {
    text: `Will deliver via ${channelLabel(channel)} → ${handle}`,
    bg: "rgba(44,160,28,0.08)",
    fg: "#1e6f12",
    swatch: channelSwatch(channel),
    initial: channelLabel(channel)[0],
  };
}

function channelSwatch(c: DeliveryChannel): string {
  switch (c) {
    case "quickbooks":
      return "#2CA01C";
    case "xero":
      return "#13B5EA";
    case "slack":
      return "#4A154B";
    case "portal":
      return "#c44e2c";
    default:
      return "#0a0a0a";
  }
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
  channel,
  deliveryHandle,
  onDone,
}: {
  amount: number;
  currency: CurrencyCode;
  clientName: string;
  channel: DeliveryChannel;
  deliveryHandle?: string;
  onDone: () => void;
}) {
  const message =
    channel === "email"
      ? `${formatMoney(amount, currency)} requested from ${clientName}`
      : `Pushed to ${clientName}'s ${channelLabel(channel)}${deliveryHandle ? ` → ${deliveryHandle}` : ""}`;
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
      <p className="text-sm text-mute mt-3 mb-10 max-w-xs">{message}</p>
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
