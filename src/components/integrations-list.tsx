"use client";

import { useState, useTransition } from "react";
import {
  connectIntegrationAction,
  disconnectIntegrationAction,
} from "@/app/_actions";
import type { Integration } from "@/lib/types";

export function IntegrationsList({
  integrations,
}: {
  integrations: Integration[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  function toggle(it: Integration) {
    setError(null);
    setPendingId(it.id);
    startTransition(async () => {
      try {
        if (it.connected) {
          await disconnectIntegrationAction(it.id);
        } else {
          await connectIntegrationAction(it.id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-xs text-accent">{error}</div>}
      {integrations.map((it) => {
        const busy = pendingId === it.id;
        return (
          <div
            key={it.id}
            className="p-4 rounded-xl border border-rule bg-card flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: it.color }}
              aria-hidden
            >
              {it.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                {it.name}
                {it.connected && (
                  <span
                    className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{
                      color: "var(--color-paid)",
                      background: "rgba(45,122,79,0.1)",
                    }}
                  >
                    Connected
                  </span>
                )}
              </div>
              <div className="text-xs text-mute mt-0.5">
                {it.connected && it.account
                  ? `${it.description} · ${it.account}`
                  : it.description}
              </div>
            </div>
            {it.connected ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((o) => (o === it.id ? null : it.id))
                  }
                  disabled={busy}
                  className="text-xs px-3.5 py-2 rounded-md bg-ink/[0.06] text-ink hover:bg-ink/10 disabled:opacity-50"
                >
                  {busy ? "…" : "Manage"}
                </button>
                {openMenu === it.id && (
                  <div
                    className="absolute right-0 top-full mt-1 z-10 min-w-[160px] rounded-lg bg-paper border border-rule shadow-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        toggle(it);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-ink/5 text-accent"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggle(it)}
                disabled={busy}
                className="text-xs px-3.5 py-2 rounded-md bg-ink text-paper hover:bg-ink/90 disabled:opacity-50"
              >
                {busy ? "…" : "Connect"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
