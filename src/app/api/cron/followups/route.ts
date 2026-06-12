import "server-only";
import {
  getAutomation,
  listAllUserIds,
  listInvoices,
} from "@/lib/server/store";
import { sendInvoiceReminder } from "@/lib/server/dispatch";
import {
  STAGE_DAYS,
  MIN_GAP_DAYS,
  effectiveReminderCount,
} from "@/lib/followup-cadence";

export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev: no secret, allow
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = Date.now();
  const uids = await listAllUserIds();
  let processed = 0;
  let reminded = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const uid of uids) {
    try {
      // Follow-ups are part of the free product now — the only gate is whether
      // the tradie left the assistant switched on.
      const auto = await getAutomation(uid, "auto-remind");
      if (!auto?.enabled) {
        skipped++;
        continue;
      }
      processed++;
      const invoices = await listInvoices(uid);
      for (const inv of invoices) {
        if (inv.status !== "sent") continue;
        const count = effectiveReminderCount(inv);
        if (count >= STAGE_DAYS.length) continue; // cadence finished
        const ageDays = (now - inv.sentAt) / DAY;
        if (ageDays < STAGE_DAYS[count]) continue; // next stage not due yet
        if (
          inv.lastReminderAt &&
          (now - inv.lastReminderAt) / DAY < MIN_GAP_DAYS
        ) {
          continue; // sent one too recently
        }
        const result = await sendInvoiceReminder(uid, inv.id, "agent");
        if (result) reminded++;
      }
    } catch (e) {
      errors.push(`${uid}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return Response.json({
    ok: true,
    processed,
    skipped,
    reminded,
    errors,
    at: new Date().toISOString(),
  });
}
