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
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        {CURRENCIES.map((cu, i) => (
          <button
            key={cu.code}
            type="button"
            onClick={() => pick(cu.code)}
            disabled={pending}
            className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-neutral-50 disabled:opacity-60"
            style={{
              borderTop: i ? "1px solid #e5e5e5" : "none",
              background:
                selected === cu.code ? "#fafafa" : "transparent",
            }}
          >
            <span className="font-mono text-sm w-8">{cu.symbol}</span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{cu.code}</span>
              <span className="block text-xs text-neutral-500">{cu.name}</span>
            </span>
            {selected === cu.code && <Check size={16} strokeWidth={2.5} />}
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500 mt-3">
        Live FX rates from exchangerate.host. New invoices default to this; you
        can override per invoice.
      </p>
      {error && <p className="text-xs text-black mt-1">{error}</p>}
    </div>
  );
}
