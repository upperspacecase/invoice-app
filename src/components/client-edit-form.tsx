"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { CURRENCIES } from "@/lib/currency";
import { updateClientAction } from "@/app/_actions";
import type { Client, CurrencyCode } from "@/lib/types";

export function ClientEditForm({ client }: { client: Client }) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [currency, setCurrency] = useState<CurrencyCode>(client.currency);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty =
    name !== client.name ||
    email !== client.email ||
    currency !== client.currency;

  function save() {
    if (!dirty) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateClientAction(client.id, { name, email, currency });
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
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
          className="font-display text-2xl sm:text-3xl leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
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

      <div className="flex items-center gap-3">
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
        {error && <span className="text-xs text-danger">{error}</span>}
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
