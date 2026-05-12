"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { voteForFeatureAction } from "@/app/_actions";
import { FEATURES, TIER_LABEL, type FeatureId } from "@/lib/features";
import { TIER_RANK, type Tier } from "@/lib/types";

export type FeatureStatus =
  | "allowed"
  | "upgrade"
  | "coming-soon"
  | "coming-soon-upsell";

export function featureStatus(
  feature: FeatureId,
  userTier: Tier
): FeatureStatus {
  const meta = FEATURES[feature];
  const inPlan = TIER_RANK[userTier] >= TIER_RANK[meta.tier];
  if (meta.built && inPlan) return "allowed";
  if (meta.built && !inPlan) return "upgrade";
  if (!meta.built && inPlan) return "coming-soon";
  return "coming-soon-upsell";
}

export function FeatureBadge({
  feature,
  userTier,
  voted,
}: {
  feature: FeatureId;
  userTier: Tier;
  voted: boolean;
}) {
  const status = featureStatus(feature, userTier);
  const meta = FEATURES[feature];

  if (status === "allowed") return null;

  if (status === "upgrade") {
    return (
      <Link
        href="/app/settings/billing"
        className="inline-flex items-center text-[10px] uppercase tracking-widest px-2 py-0.5 rounded transition-colors hover:opacity-80"
        style={{
          color: "var(--color-accent)",
          background: "rgba(196,78,44,0.1)",
        }}
      >
        Upgrade to {TIER_LABEL[meta.tier]}
      </Link>
    );
  }

  return <VoteChip feature={feature} userTier={userTier} voted={voted} />;
}

function VoteChip({
  feature,
  userTier,
  voted: initialVoted,
}: {
  feature: FeatureId;
  userTier: Tier;
  voted: boolean;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();
  const meta = FEATURES[feature];
  const inPlan = TIER_RANK[userTier] >= TIER_RANK[meta.tier];

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

  const label = voted
    ? "Voted"
    : inPlan
    ? "Coming soon · vote"
    : `Coming soon · part of ${TIER_LABEL[meta.tier]}`;

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || pending}
      title={voted ? "Thanks — vote recorded" : "Click to prioritise this build"}
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded transition-colors hover:opacity-80 disabled:cursor-default"
      style={{
        color: voted ? "var(--color-paid)" : "var(--color-mute)",
        background: voted
          ? "rgba(45,122,79,0.1)"
          : "rgba(10,10,10,0.05)",
      }}
    >
      {voted && <Check size={10} strokeWidth={3} />}
      {label}
    </button>
  );
}

export function FeatureLock({
  feature,
  userTier,
  voted,
  children,
}: {
  feature: FeatureId;
  userTier: Tier;
  voted: boolean;
  children: React.ReactNode;
}) {
  const status = featureStatus(feature, userTier);
  if (status === "allowed") return <>{children}</>;

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
        <div className="bg-paper border border-rule rounded-lg px-3 py-2 shadow-sm text-xs flex items-center gap-2 max-w-[90%]">
          <FeatureBadge feature={feature} userTier={userTier} voted={voted} />
          <span className="text-mute hidden sm:inline">
            {FEATURES[feature].name}
          </span>
        </div>
      </div>
    </div>
  );
}
