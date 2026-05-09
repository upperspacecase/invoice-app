"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Link as LinkIcon, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { CURRENCIES } from "@/lib/currency";
import { updateClientAction } from "@/app/_actions";
import type {
  Client,
  CurrencyCode,
  DeliveryChannel,
  Integration,
} from "@/lib/types";

const DELIVERY_OPTIONS: ReadonlyArray<{
  id: DeliveryChannel;
  label: string;
  needsIntegration: boolean;
}> = [
  { id: "email", label: "Email", needsIntegration: false },
  { id: "quickbooks", label: "QuickBooks", needsIntegration: true },
  { id: "xero", label: "Xero", needsIntegration: true },
  { id: "slack", label: "Slack", needsIntegration: true },
  { id: "webhook", label: "Webhook", needsIntegration: true },
  { id: "portal", label: "Portal link", needsIntegration: false },
];

export function ClientEditForm({
  client,
  integrations,
}: {
  client: Client;
  integrations: Integration[];
}) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [currency, setCurrency] = useState<CurrencyCode>(client.currency);
  const [delivery, setDelivery] = useState<DeliveryChannel>(client.delivery);
  const [deliveryHandle, setDeliveryHandle] = useState(
    client.deliveryHandle ?? ""
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty =
    name !== client.name ||
    email !== client.email ||
    currency !== client.currency ||
    delivery !== client.delivery ||
    (deliveryHandle || "") !== (client.deliveryHandle ?? "");

  function save() {
    if (!dirty) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateClientAction(client.id, {
          name,
          email,
          currency,
          delivery,
          deliveryHandle: deliveryHandle.trim() || undefined,
        });
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  function handleDeliveryDescription(opt: DeliveryChannel): string {
    switch (opt) {
      case "email":
        return email;
      case "quickbooks":
      case "xero":
        return deliveryHandle || "Connected account";
      case "slack":
        return deliveryHandle || "#channel";
      case "webhook":
        return deliveryHandle || "https://…";
      case "portal":
        return "They click a link and view + pay";
      default:
        return "";
    }
  }

  return (
    <div className="pt-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/app/settings/account"
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1
          className="font-serif text-2xl sm:text-3xl leading-tight"
          style={{ fontWeight: 400 }}
        >
          {client.name}
        </h1>
      </div>

      <div className="text-xs uppercase tracking-widest text-mute mb-3">
        Details
      </div>
      <div className="space-y-3 mb-8">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </Field>
        <Field label="Billing email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </Field>
        <Field label="Currency">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="w-full bg-transparent outline-none text-sm pr-2"
          >
            {CURRENCIES.map((cu) => (
              <option key={cu.code} value={cu.code}>
                {cu.code} — {cu.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="text-xs uppercase tracking-widest text-mute mb-3">
        Deliver invoices via
      </div>
      <div className="space-y-2">
        {DELIVERY_OPTIONS.map((opt) => {
          const integration =
            opt.needsIntegration
              ? integrations.find((it) => it.id === opt.id)
              : undefined;
          const ready = !opt.needsIntegration || integration?.connected;
          const selected = delivery === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDelivery(opt.id)}
              disabled={!ready}
              className="w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: selected
                  ? "1px solid var(--color-ink)"
                  : "1px solid var(--color-rule)",
                background: selected
                  ? "rgba(10,10,10,0.03)"
                  : "var(--color-card)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: deliveryColor(opt.id) }}
                aria-hidden
              >
                {opt.id === "email" ? (
                  <Mail size={14} />
                ) : opt.id === "portal" ? (
                  <LinkIcon size={14} />
                ) : (
                  opt.label[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {opt.label}
                  {!ready && (
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-mute">
                      Connect first
                    </span>
                  )}
                </div>
                <div className="text-xs text-mute mt-0.5 truncate">
                  {handleDeliveryDescription(opt.id)}
                </div>
              </div>
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  border: selected
                    ? "1.5px solid var(--color-ink)"
                    : "1.5px solid var(--color-rule)",
                }}
              >
                {selected && (
                  <span
                    aria-hidden
                    className="w-2 h-2 rounded-full bg-ink"
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {(delivery === "quickbooks" ||
        delivery === "xero" ||
        delivery === "slack" ||
        delivery === "webhook") && (
        <div className="mt-4">
          <label className="block text-xs text-mute mb-1">
            {delivery === "slack"
              ? "Channel"
              : delivery === "webhook"
              ? "URL"
              : "Account ID"}
          </label>
          <input
            type="text"
            value={deliveryHandle}
            onChange={(e) => setDeliveryHandle(e.target.value)}
            placeholder={
              delivery === "slack"
                ? "#client-billing"
                : delivery === "webhook"
                ? "https://example.com/hooks/invoices"
                : "acme-studios-llc"
            }
            className="w-full h-10 px-3 rounded-md border border-rule bg-card outline-none focus:border-ink/40 text-sm"
          />
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="px-5 h-11 rounded-md bg-ink text-paper text-sm font-medium hover:bg-ink/90 disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {saved && !pending && (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-paid)]">
            <Check size={14} strokeWidth={2.5} />
            Saved
          </span>
        )}
        {error && <span className="text-xs text-accent">{error}</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-3 border-b border-rule">
      <div className="text-xs text-mute mb-1">{label}</div>
      {children}
    </div>
  );
}

function deliveryColor(c: DeliveryChannel): string {
  switch (c) {
    case "quickbooks":
      return "#2CA01C";
    case "xero":
      return "#13B5EA";
    case "slack":
      return "#4A154B";
    case "portal":
      return "#c44e2c";
    case "webhook":
      return "#0a0a0a";
    default:
      return "rgba(10,10,10,0.5)";
  }
}
