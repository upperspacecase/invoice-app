"use client";

import { useState, useTransition } from "react";
import { setAutomationAction } from "@/app/_actions";
import type { Automation } from "@/lib/types";

export function AutomationsList({
  automations,
}: {
  automations: Automation[];
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(a: Automation) {
    setPendingId(a.id);
    setError(null);
    startTransition(async () => {
      try {
        await setAutomationAction(a.id, !a.enabled);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div>
      {error && <div className="text-xs text-danger mb-3">{error}</div>}
      <ul className="space-y-2">
        {automations.map((a) => {
          const busy = pendingId === a.id;
          return (
            <li
              key={a.id}
              className="p-4 rounded-xl border border-rule bg-card flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-mute mt-1">{a.body}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={a.enabled}
                aria-label={`Toggle ${a.title}`}
                onClick={() => toggle(a)}
                disabled={busy}
                className="rounded-full transition-colors flex-shrink-0 disabled:cursor-not-allowed"
                style={{
                  width: 38,
                  height: 22,
                  padding: 2,
                  background: a.enabled
                    ? "var(--color-ink)"
                    : "rgba(10,10,10,0.15)",
                  display: "flex",
                  justifyContent: a.enabled ? "flex-end" : "flex-start",
                  alignItems: "center",
                }}
              >
                <span
                  aria-hidden
                  className="block w-[18px] h-[18px] rounded-full bg-paper transition-transform"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
