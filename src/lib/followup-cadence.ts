import type { FollowupStage, Invoice } from "./types";

const DAY = 24 * 60 * 60 * 1000;

// Cadence keyed on the invoice's DUE date (not its send date):
//   stage 0 — friendly heads-up at dueAt - 3d (only when there's lead time)
//   stage 1 — follow-up      at dueAt + 3d
//   stage 2 — firmer nudge   at dueAt + 14d
//   stage 3 — final notice   at dueAt + 30d
// This matches the schedule the landing page promises. Stops after stage 3 or
// when the invoice is paid.
export const HEADS_UP_DAYS_BEFORE_DUE = 3;
export const HEADS_UP_MIN_LEAD_DAYS = 3; // skip the heads-up unless it lands ≥3d after send
export const OVERDUE_STAGE_DAYS = [3, 14, 30]; // stages 1..3, days after dueAt
export const MIN_GAP_DAYS = 5; // never fire two stages within this window
export const FINAL_STAGE = 3;

// Payment-terms picker (days from today → dueAt). 0 = "On receipt".
export const DEFAULT_TERMS_DAYS = 14;
export const TERMS_OPTIONS = [0, 7, 14, 30];

const STAGE_LABEL: Record<FollowupStage, string> = {
  0: "Friendly reminder",
  1: "Follow-up",
  2: "Firmer nudge",
  3: "Final notice",
};

export function stageLabel(stage: FollowupStage): string {
  return STAGE_LABEL[stage];
}

// Scheduled time for a given stage of a given invoice.
export function stageAt(inv: Pick<Invoice, "dueAt">, stage: FollowupStage): number {
  if (stage === 0) return inv.dueAt - HEADS_UP_DAYS_BEFORE_DUE * DAY;
  return inv.dueAt + OVERDUE_STAGE_DAYS[stage - 1] * DAY;
}

// The heads-up only makes sense when the invoice was sent well before its due
// date — otherwise it would land moments after the invoice itself.
export function headsUpEligible(inv: Pick<Invoice, "dueAt" | "sentAt">): boolean {
  return stageAt(inv, 0) - inv.sentAt >= HEADS_UP_MIN_LEAD_DAYS * DAY;
}

// Deepest stage already sent (-1 = none). Reads lastStage; falls back to the
// legacy reminderCount/lastReminderAt for docs written before lastStage
// existed (old stages 1/2/3 map 1:1; heads-up never existed then).
export function effectiveLastStage(inv: Invoice): number {
  if (typeof inv.lastStage === "number") return inv.lastStage;
  if (inv.reminderCount) return Math.min(inv.reminderCount, FINAL_STAGE);
  if (inv.lastReminderAt) return 1;
  return -1;
}

// The deepest stage whose scheduled time has passed as of `now`, skipping an
// ineligible heads-up. -1 if nothing is due yet.
export function deepestDueStage(inv: Invoice, now: number): number {
  let deepest = -1;
  for (let stage = 0 as FollowupStage; stage <= FINAL_STAGE; stage++) {
    if (stage === 0 && !headsUpEligible(inv)) continue;
    if (now >= stageAt(inv, stage)) deepest = stage;
  }
  return deepest;
}

// The stage the cron should send next for this invoice as of `now`, or null if
// nothing is owed. Single source of truth shared by the cron and the manual
// "remind now" path so predictions and behaviour never disagree.
export function dueStage(inv: Invoice, now: number): FollowupStage | null {
  if (inv.status !== "sent") return null;
  const last = effectiveLastStage(inv);
  if (last >= FINAL_STAGE) return null;
  const target = deepestDueStage(inv, now);
  if (target <= last) return null;
  if (inv.lastReminderAt && now - inv.lastReminderAt < MIN_GAP_DAYS * DAY) {
    return null; // sent one too recently
  }
  return target as FollowupStage;
}

// When the agent will next follow up, or null if finished/not chaseable. The
// scheduled time of the next un-sent eligible stage, floored by the min-gap.
export function nextNudgeAt(inv: Invoice): number | null {
  if (inv.status !== "sent") return null;
  const last = effectiveLastStage(inv);
  let next: FollowupStage | null = null;
  for (let stage = (last + 1) as FollowupStage; stage <= FINAL_STAGE; stage++) {
    if (stage === 0 && !headsUpEligible(inv)) continue;
    next = stage;
    break;
  }
  if (next === null) return null;
  const dueByTime = stageAt(inv, next);
  const dueByGap = inv.lastReminderAt ? inv.lastReminderAt + MIN_GAP_DAYS * DAY : 0;
  return Math.max(dueByTime, dueByGap);
}

export type ChaseStep = { stage: FollowupStage; label: string; at: number };

// The full plan for an invoice, used on the send/upload confirmation screen.
// Filters out an ineligible heads-up.
export function chasePlan(inv: Pick<Invoice, "dueAt" | "sentAt">): ChaseStep[] {
  const steps: ChaseStep[] = [];
  for (let stage = 0 as FollowupStage; stage <= FINAL_STAGE; stage++) {
    if (stage === 0 && !headsUpEligible(inv)) continue;
    steps.push({ stage, label: STAGE_LABEL[stage], at: stageAt(inv, stage) });
  }
  return steps;
}

export function formatChaseDate(at: number): string {
  return new Date(at).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// True if the invoice was paid within the last `windowMs`. Kept here (not in a
// component) so the Date.now() read stays out of render scope.
export function paidWithin(inv: Invoice, windowMs: number): boolean {
  return (
    inv.status === "paid" &&
    inv.paidAt !== undefined &&
    Date.now() - inv.paidAt < windowMs
  );
}

export function relativeTime(at: number): string {
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  return new Date(at).toLocaleDateString();
}

// The line shown under each ledger row describing what the agent is doing.
// Returns null when there's nothing to say.
export function chaseLine(inv: Invoice, agentActive: boolean): string | null {
  if (inv.status === "paid") return "Paid — good as gold";
  if (!agentActive) return "Chasing paused";
  const last = effectiveLastStage(inv);
  if (last >= FINAL_STAGE) {
    const when = inv.lastReminderAt ? formatChaseDate(inv.lastReminderAt) : null;
    return when ? `Final notice sent ${when}` : "Final notice sent";
  }
  const now = Date.now();
  const next = nextNudgeAt(inv);
  // Pre-due: reassure, don't threaten.
  if (now < inv.dueAt) {
    if (last === 0) return `Heads-up sent — due ${formatChaseDate(inv.dueAt)}`;
    return `Due ${formatChaseDate(inv.dueAt)}`;
  }
  // Overdue.
  if (next === null) return null;
  if (next <= now) return "Overdue — Nudge is on it";
  const nextStage = Math.min(last + 1, FINAL_STAGE) as FollowupStage;
  return `Overdue — ${STAGE_LABEL[nextStage].toLowerCase()} ${formatChaseDate(next)}`;
}
