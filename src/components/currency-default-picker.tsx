"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { setDefaultCurrencyAction } from "@/app/_actions";
import type { CurrencyCode } from "@/lib/types";

export function CurrencyDefaultPicker({
  current,
}: {
  current: CurrencyCode;
}) {
  const [selected, setSelected] = useState<CurrencyCode>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick(code: CurrencyCode) {
    if (code === selected) return;
    setError(null);
    setSelected(code);
    startTransition(async () => {
      try {
        await setDefaultCurrencyAction(code);
      } catch (e) {
        setSelected(current);
        setError(e instanceof Error ? e.message : "Failed to update");
      }
    });
  }

  return (
    <div>
      <div className="border border-rule rounded-xl overflow-hidden">
        {CURRENCIES.map((cu, i) => (
          <button
            key={cu.code}
            type="button"
            onClick={() => pick(cu.code)}
            disabled={pending}
            className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-ink/[0.03] disabled:opacity-60"
            style={{
              borderTop: i ? "1px solid var(--color-rule)" : "none",
              background:
                selected === cu.code ? "rgba(10,10,10,0.03)" : "transparent",
            }}
          >
            <span className="font-mono text-sm w-8">{cu.symbol}</span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{cu.code}</span>
              <span className="block text-xs text-mute">{cu.name}</span>
            </span>
            {selected === cu.code && <Check size={16} strokeWidth={2.5} />}
          </button>
        ))}
      </div>
      <p className="text-xs text-mute mt-3">
        Live FX rates from exchangerate.host. New invoices default to this; you
        can override per invoice.
      </p>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
