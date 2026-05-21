"use client";

import { useState, useTransition } from "react";
import {
  connectIntegrationAction,
  disconnectIntegrationAction,
} from "@/app/_actions";
import type { Integration } from "@/lib/types";

export function IntegrationsList({
  integrations,
  locked = false,
}: {
  integrations: Integration[];
  locked?: boolean;
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
      {error && <div className="text-xs text-black">{error}</div>}
      {integrations.map((it) => {
        const busy = pendingId === it.id;
        return (
          <div
            key={it.id}
            className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: "#000000" }}
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
                      color: "#000000",
                      background: "#f5f5f5",
                    }}
                  >
                    Connected
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {it.connected && it.account
                  ? `${it.description} · ${it.account}`
                  : it.description}
              </div>
            </div>
            {locked ? (
              <a
                href="/app/settings/billing"
                className="text-xs px-3.5 py-2 rounded-md bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                Upgrade to connect
              </a>
            ) : it.connected ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((o) => (o === it.id ? null : it.id))
                  }
                  disabled={busy}
                  className="text-xs px-3.5 py-2 rounded-md bg-neutral-100 text-black hover:bg-neutral-200 disabled:opacity-50"
                >
                  {busy ? "…" : "Manage"}
                </button>
                {openMenu === it.id && (
                  <div
                    className="absolute right-0 top-full mt-1 z-10 min-w-[160px] rounded-lg bg-white border border-neutral-200 shadow-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        toggle(it);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 text-black"
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
                className="text-xs px-3.5 py-2 rounded-md bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
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
