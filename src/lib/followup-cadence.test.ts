import { describe, it, expect, vi, afterEach } from "vitest";
import type { Invoice } from "./types";
import {
  chasePlan,
  chaseLine,
  deepestDueStage,
  dueStage,
  effectiveLastStage,
  headsUpEligible,
  nextNudgeAt,
  stageAt,
  FINAL_STAGE,
} from "./followup-cadence";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 5, 1); // fixed reference

function inv(over: Partial<Invoice> = {}): Invoice {
  return {
    id: "INV-001",
    clientId: "c",
    clientName: "Client",
    clientEmail: "c@x.co",
    amount: 1000,
    currency: "GBP",
    description: "Work",
    date: "1 Jun",
    status: "sent",
    sentAt: NOW,
    dueAt: NOW + 14 * DAY,
    ...over,
  };
}

afterEach(() => vi.useRealTimers());

describe("chasePlan (the schedule the landing page promises)", () => {
  it("14-day terms → 4 dated steps matching due-3 / due+3 / due+14 / due+30", () => {
    const i = inv({ sentAt: NOW, dueAt: NOW + 14 * DAY });
    const plan = chasePlan(i);
    expect(plan.map((s) => s.stage)).toEqual([0, 1, 2, 3]);
    expect(plan[0].at).toBe(i.dueAt - 3 * DAY);
    expect(plan[1].at).toBe(i.dueAt + 3 * DAY);
    expect(plan[2].at).toBe(i.dueAt + 14 * DAY);
    expect(plan[3].at).toBe(i.dueAt + 30 * DAY);
    expect(plan.map((s) => s.label)).toEqual([
      "Friendly reminder",
      "Follow-up",
      "Firmer nudge",
      "Final notice",
    ]);
  });
});

describe("headsUpEligible (lead-time guard)", () => {
  it.each([
    [0, false],
    [5, false],
    [6, true],
    [7, true],
    [14, true],
  ])("terms=%i days → eligible=%s", (terms, eligible) => {
    expect(headsUpEligible(inv({ sentAt: NOW, dueAt: NOW + terms * DAY }))).toBe(
      eligible
    );
  });

  it("on-receipt terms drop the heads-up from the plan (3 steps)", () => {
    expect(chasePlan(inv({ sentAt: NOW, dueAt: NOW })).map((s) => s.stage)).toEqual([
      1, 2, 3,
    ]);
  });
});

describe("deepestDueStage + dueStage (cron stage selection)", () => {
  it("a 45-day-overdue invoice sends exactly one email: the final notice", () => {
    const i = inv({ sentAt: NOW - 59 * DAY, dueAt: NOW - 45 * DAY });
    expect(deepestDueStage(i, NOW)).toBe(3);
    expect(dueStage(i, NOW)).toBe(3);
  });

  it("nothing due before the heads-up slot", () => {
    const i = inv({ sentAt: NOW, dueAt: NOW + 14 * DAY });
    expect(dueStage(i, NOW)).toBeNull();
    expect(deepestDueStage(i, NOW)).toBe(-1);
  });

  it("heads-up fires once due-3d arrives, then not again", () => {
    const i = inv({ sentAt: NOW, dueAt: NOW + 14 * DAY });
    const atHeadsUp = stageAt(i, 0);
    expect(dueStage(i, atHeadsUp)).toBe(0);
    // after sending stage 0, lastStage=0 → nothing new until due+3
    const sent = { ...i, lastStage: 0, lastReminderAt: atHeadsUp };
    expect(dueStage(sent, atHeadsUp + DAY)).toBeNull();
    expect(dueStage(sent, i.dueAt + 3 * DAY)).toBe(1);
  });

  it("MIN_GAP suppresses a stage sent too recently", () => {
    const i = inv({
      sentAt: NOW - 20 * DAY,
      dueAt: NOW - 6 * DAY, // stage 1 (due+3) is due
      lastStage: 0,
      lastReminderAt: NOW - 2 * DAY, // only 2 days ago
    });
    expect(deepestDueStage(i, NOW)).toBeGreaterThanOrEqual(1);
    expect(dueStage(i, NOW)).toBeNull();
  });

  it("paid invoices are never chased", () => {
    expect(dueStage(inv({ status: "paid", dueAt: NOW - 60 * DAY }), NOW)).toBeNull();
  });
});

describe("legacy doc tolerance", () => {
  it("reminderCount=2 with no lastStage maps to stage 2, leaving only final", () => {
    const i = inv({
      reminderCount: 2,
      sentAt: NOW - 60 * DAY,
      dueAt: NOW - 46 * DAY,
    });
    expect(effectiveLastStage(i)).toBe(2);
    expect(dueStage(i, NOW)).toBe(3);
  });

  it("lastReminderAt-only legacy doc counts as stage 1", () => {
    expect(effectiveLastStage(inv({ lastReminderAt: NOW - 40 * DAY }))).toBe(1);
  });
});

describe("dueStage ⇔ nextNudgeAt agreement", () => {
  it("when a stage is due now, the predicted next time is in the past", () => {
    const i = inv({ sentAt: NOW - 20 * DAY, dueAt: NOW - 5 * DAY });
    expect(dueStage(i, NOW)).not.toBeNull();
    expect(nextNudgeAt(i)!).toBeLessThanOrEqual(NOW);
  });

  it("when nothing is due, the predicted next time is in the future", () => {
    const i = inv({ sentAt: NOW, dueAt: NOW + 14 * DAY });
    expect(dueStage(i, NOW)).toBeNull();
    expect(nextNudgeAt(i)!).toBeGreaterThan(NOW);
  });

  it("finished cadence predicts null", () => {
    expect(nextNudgeAt(inv({ lastStage: FINAL_STAGE }))).toBeNull();
  });
});

describe("chaseLine (ledger states)", () => {
  it("pre-due shows the due date", () => {
    vi.setSystemTime(NOW);
    expect(chaseLine(inv({ dueAt: NOW + 10 * DAY }), true)).toMatch(/^Due /);
  });
  it("paused when the agent is off", () => {
    vi.setSystemTime(NOW);
    expect(chaseLine(inv(), false)).toBe("Chasing paused");
  });
  it("overdue shows it's on it or names the next stage", () => {
    vi.setSystemTime(NOW);
    const line = chaseLine(inv({ sentAt: NOW - 20 * DAY, dueAt: NOW - 5 * DAY }), true);
    expect(line).toMatch(/Overdue/);
  });
  it("paid is good as gold", () => {
    vi.setSystemTime(NOW);
    expect(chaseLine(inv({ status: "paid", paidAt: NOW }), true)).toBe(
      "Paid — good as gold"
    );
  });
});
