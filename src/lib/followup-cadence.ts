import type { Invoice } from "./types";

const DAY = 24 * 60 * 60 * 1000;

// Days since the invoice was sent that each stage fires at:
// stage 1 (polite) @ 7, stage 2 (firm) @ 14, stage 3 (final) @ 30. Stops after 3.
export const STAGE_DAYS = [7, 14, 30];
export const MIN_GAP_DAYS = 5; // never fire two stages within this window

// How many reminders have effectively been sent. A legacy invoice that only
// recorded lastReminderAt (no count) is treated as stage 1 already sent —
// mirrors the cron's original fallback so predictions match what it will do.
export function effectiveReminderCount(inv: Invoice): number {
  return inv.reminderCount ?? (inv.lastReminderAt ? 1 : 0);
}

// When the agent will next follow up, or null if the cadence is finished /
// the invoice isn't in a chaseable state. This is the cron's gate logic
// inverted into a prediction (the scheduled due time = the later of the
// age gate and the min-gap gate), so the two never disagree.
export function nextNudgeAt(inv: Invoice): number | null {
  if (inv.status !== "sent") return null;
  const count = effectiveReminderCount(inv);
  if (count >= STAGE_DAYS.length) return null;
  const dueByAge = inv.sentAt + STAGE_DAYS[count] * DAY;
  const dueByGap = inv.lastReminderAt ? inv.lastReminderAt + MIN_GAP_DAYS * DAY : 0;
  return Math.max(dueByAge, dueByGap);
}

// The three scheduled chase dates for a freshly-sent invoice, used on the
// send-confirmation screen to show the tradie the plan.
export function chasePlanDates(sentAt: number): number[] {
  return STAGE_DAYS.map((d) => sentAt + d * DAY);
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
// Returns null when there's nothing to say (e.g. a paid invoice — the row
// already shows its paid state elsewhere).
export function chaseLine(inv: Invoice, agentActive: boolean): string | null {
  if (inv.status === "paid") return "Paid — good as gold";
  const count = effectiveReminderCount(inv);
  if (!agentActive) return "Chasing paused";
  if (count >= STAGE_DAYS.length) {
    const when = inv.lastReminderAt ? formatChaseDate(inv.lastReminderAt) : null;
    return when ? `Final notice sent ${when}` : "Final notice sent";
  }
  const next = nextNudgeAt(inv);
  if (next === null) return null;
  const when = formatChaseDate(next);
  const overdue = next <= Date.now();
  if (count === 0) {
    return overdue ? "Follow-up due — Nudge is on it" : `Nudge follows up ${when}`;
  }
  if (count === 1) {
    return overdue
      ? "Follow-up due — Nudge is on it"
      : `Nudged once — follows up ${when}`;
  }
  // count === 2
  return overdue
    ? "Final notice due — Nudge is on it"
    : `Nudged twice — final notice ${when}`;
}
