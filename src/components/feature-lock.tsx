"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { voteForFeatureAction } from "@/app/_actions";
import { FEATURES, type FeatureId } from "@/lib/features";

export type FeatureStatus = "allowed" | "coming-soon";

// Every feature is included on the single 1% plan — the only thing that can
// gate a feature now is whether it has actually been built yet.
export function featureStatus(feature: FeatureId): FeatureStatus {
  return FEATURES[feature].built ? "allowed" : "coming-soon";
}

export function FeatureBadge({
  feature,
  voted,
}: {
  feature: FeatureId;
  voted: boolean;
}) {
  if (featureStatus(feature) === "allowed") return null;
  return <VoteChip feature={feature} voted={voted} />;
}

function VoteChip({
  feature,
  voted: initialVoted,
}: {
  feature: FeatureId;
  voted: boolean;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();

  function vote() {
    if (voted || pending) return;
    setVoted(true);
    startTransition(async () => {
      try {
        await voteForFeatureAction(feature);
      } catch {
        setVoted(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || pending}
      title={voted ? "Thanks — vote recorded" : "Click to prioritise this build"}
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 transition-colors hover:opacity-80 disabled:cursor-default"
    >
      {voted && <Check size={10} strokeWidth={3} />}
      {voted ? "Voted" : "Coming soon · vote"}
    </button>
  );
}

export function FeatureLock({
  feature,
  voted,
  children,
}: {
  feature: FeatureId;
  voted: boolean;
  children: React.ReactNode;
}) {
  if (featureStatus(feature) === "allowed") return <>{children}</>;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none"
        style={{ opacity: 0.45, filter: "grayscale(0.4)" }}
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-sm text-xs flex items-center gap-2 max-w-[90%]">
          <FeatureBadge feature={feature} voted={voted} />
          <span className="text-neutral-500 hidden sm:inline">
            {FEATURES[feature].name}
          </span>
        </div>
      </div>
    </div>
  );
}
