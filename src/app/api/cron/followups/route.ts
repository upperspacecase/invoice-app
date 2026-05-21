import "server-only";
import {
  getAutomation,
  listAllUserIds,
  listInvoices,
} from "@/lib/server/store";
import { sendInvoiceReminder } from "@/lib/server/dispatch";

export const runtime = "nodejs";

// Smart follow-ups cadence: a gentle nudge on day 3, then 10, then 21 after
// an invoice was sent. The assistant stops after the third.
const SCHEDULE_DAYS = [3, 10, 21];
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
      const auto = await getAutomation(uid, "auto-remind");
      if (!auto?.enabled) {
        skipped++;
        continue;
      }
      processed++;
      const invoices = await listInvoices(uid);
      for (const inv of invoices) {
        if (inv.status !== "sent" || inv.channel !== "email") continue;
        const count = inv.reminderCount ?? 0;
        if (count >= SCHEDULE_DAYS.length) continue; // cadence finished
        const daysSinceSent = (now - inv.sentAt) / DAY;
        if (daysSinceSent < SCHEDULE_DAYS[count]) continue; // not due yet
        // Guard against a second nudge inside the same run window.
        if (inv.lastReminderAt && now - inv.lastReminderAt < 20 * 60 * 60 * 1000) {
          continue;
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
