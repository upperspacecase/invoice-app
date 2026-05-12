import "server-only";
import {
  getAutomation,
  getBusiness,
  listAllUserIds,
  listInvoices,
} from "@/lib/server/store";
import { sendInvoiceReminder } from "@/lib/server/dispatch";

export const runtime = "nodejs";

const REMIND_AFTER_DAYS = 7;

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
  const cutoff = Date.now() - REMIND_AFTER_DAYS * 24 * 60 * 60 * 1000;
  const uids = await listAllUserIds();
  let processed = 0;
  let reminded = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const uid of uids) {
    try {
      const business = await getBusiness(uid);
      if (business.tier !== "get-paid") {
        skipped++;
        continue;
      }
      const auto = await getAutomation(uid, "auto-remind");
      if (!auto?.enabled) {
        skipped++;
        continue;
      }
      processed++;
      const invoices = await listInvoices(uid);
      const due = invoices.filter(
        (i) =>
          i.status === "sent" &&
          i.sentAt <= cutoff &&
          !i.lastReminderAt &&
          i.channel === "email"
      );
      for (const inv of due) {
        const result = await sendInvoiceReminder(uid, inv.id, "agent");
        if (result) reminded++;
      }
    } catch (e) {
      errors.push(
        `${uid}: ${e instanceof Error ? e.message : "unknown"}`
      );
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
