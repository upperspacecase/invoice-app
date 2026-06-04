"use client";

import { useState, useTransition } from "react";
import { setAutomationAction } from "@/app/_actions";
import { FeatureBadge, featureStatus } from "@/components/feature-lock";
import type { Automation, AutomationId, Tier } from "@/lib/types";
import type { FeatureId } from "@/lib/features";

// Maps each persisted automation row to its feature entry so gating logic
// (built? required tier?) is sourced from the single feature catalog.
const FEATURE_FOR_AUTOMATION: Record<AutomationId, FeatureId> = {
  "auto-remind": "auto-reminders",
  "auto-mark-paid": "auto-mark-paid",
  "weekly-summary": "weekly-summary",
  "agent-approval": "agent-approval",
};

const EXTRA_ROWS: ReadonlyArray<{
  feature: FeatureId;
  title: string;
  body: string;
}> = [
  {
    feature: "recurring-invoices",
    title: "Recurring invoices",
    body: "Set a retainer once; it ships on the day you choose.",
  },
];

export function AutomationsList({
  automations,
  userTier,
  votes,
}: {
  automations: Automation[];
  userTier: Tier;
  votes: FeatureId[];
}) {
  const [pendingId, setPendingId] = useState<AutomationId | null>(null);
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
          const feature = FEATURE_FOR_AUTOMATION[a.id];
          const status = featureStatus(feature, userTier);
          const interactive = status === "allowed";
          const busy = pendingId === a.id;
          const voted = votes.includes(feature);
          return (
            <li
              key={a.id}
              className="p-4 rounded-xl border border-rule bg-card flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                  {a.title}
                  <FeatureBadge
                    feature={feature}
                    userTier={userTier}
                    voted={voted}
                  />
                </div>
                <div className="text-xs text-mute mt-1">{a.body}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={a.enabled}
                aria-label={`Toggle ${a.title}`}
                onClick={() => toggle(a)}
                disabled={busy || !interactive}
                className="rounded-full transition-colors flex-shrink-0 disabled:cursor-not-allowed"
                style={{
                  width: 38,
                  height: 22,
                  padding: 2,
                  opacity: interactive ? 1 : 0.4,
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

        {EXTRA_ROWS.map((row) => {
          const voted = votes.includes(row.feature);
          return (
            <li
              key={row.feature}
              className="p-4 rounded-xl border border-rule bg-card flex items-start gap-3"
              style={{ opacity: 0.85 }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                  {row.title}
                  <FeatureBadge
                    feature={row.feature}
                    userTier={userTier}
                    voted={voted}
                  />
                </div>
                <div className="text-xs text-mute mt-1">{row.body}</div>
              </div>
              <span
                aria-hidden
                className="rounded-full flex-shrink-0"
                style={{
                  width: 38,
                  height: 22,
                  padding: 2,
                  opacity: 0.4,
                  background: "rgba(10,10,10,0.15)",
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
