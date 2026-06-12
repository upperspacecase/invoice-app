import Link from "next/link";
import Image from "next/image";
import { Plus, Mail } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { getRates, convertSync } from "@/lib/fx";
import { formatMoney } from "@/lib/currency";
import { chaseLine, relativeTime, paidWithin } from "@/lib/followup-cadence";
import type { CurrencyCode, Invoice } from "@/lib/types";

const PAID_CELEBRATION_WINDOW = 72 * 60 * 60 * 1000;

export default async function LedgerPage() {
  const { uid } = await requireOnboardedSession();
  const [{ business, invoices, automations, activity }, rates] =
    await Promise.all([getWorkspace(uid), getRates()]);

  const unpaid = invoices.filter((i) => i.status === "sent");

  let outstandingDefault = 0;
  for (const inv of unpaid) {
    outstandingDefault += await convertSync(
      inv.amount,
      inv.currency,
      business.currency,
      rates
    );
  }
  outstandingDefault = Math.round(outstandingDefault);

  const breakdown = bucketByCurrency(unpaid);
  const agentActive =
    automations.find((a) => a.id === "auto-remind")?.enabled ?? false;
  const latestAgentEvent = activity.find((e) => e.who === "agent");
  const justPaid = invoices.find((inv) =>
    paidWithin(inv, PAID_CELEBRATION_WINDOW)
  );

  return (
    <div className="pt-10 sm:pt-14">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-mute">
          Ledger
        </div>
        <h1
          className="font-display text-4xl sm:text-5xl mt-1 leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {business.name}
        </h1>
      </div>

      <div
        className="bg-ink text-paper p-6 mb-8"
        style={{ boxShadow: "5px 5px 0 var(--color-paid)" }}
      >
        <div className="text-xs uppercase tracking-widest text-paper/60">
          Outstanding · {business.currency} equiv.
        </div>
        <div className="font-mono text-5xl mt-3" style={{ fontWeight: 300 }}>
          {formatMoney(outstandingDefault, business.currency)}
        </div>
        <div className="text-xs text-paper/60 mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <span>{unpaid.length} unpaid</span>
          {breakdown.length > 0 && <span>·</span>}
          {breakdown.map((b) => (
            <span key={b.currency} className="font-mono">
              {formatMoney(b.amount, b.currency)} {b.currency}
            </span>
          ))}
        </div>
      </div>

      {justPaid && (
        <div className="flex items-center gap-4 border border-rule bg-card p-4 mb-8">
          <Image
            src="/brand/nudge-goblin.png"
            alt="Nudge"
            width={56}
            height={56}
            className="border border-rule flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-display text-lg" style={{ fontWeight: 700 }}>
              {justPaid.id} paid — good as gold.
            </div>
            <div
              className="text-sm font-mono mt-0.5"
              style={{ color: "var(--color-paid-deep)" }}
            >
              {formatMoney(justPaid.amount, justPaid.currency)} landed
            </div>
          </div>
        </div>
      )}

      {latestAgentEvent && (
        <Link
          href="/app/activity"
          className="block border border-rule bg-card p-4 mb-8 hover:border-ink/30 transition-colors"
        >
          <div className="text-[10px] uppercase tracking-widest text-mute font-mono mb-1">
            Nudge&apos;s log
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-sm truncate">{latestAgentEvent.text}</span>
            <span className="text-[11px] text-mute flex-shrink-0">
              {relativeTime(latestAgentEvent.at)}
            </span>
          </div>
        </Link>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="text-xs uppercase tracking-widest text-mute">
          Recent
        </div>
        <Link
          href="/app/activity"
          className="text-xs text-mute inline-flex items-center gap-1.5 hover:text-ink transition-colors"
        >
          <span
            aria-hidden
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: agentActive
                ? "var(--color-paid)"
                : "var(--color-rule)",
            }}
          />
          {agentActive ? "Agent active" : "Agent paused"}
        </Link>
      </div>

      {invoices.length === 0 && (
        <div className="flex flex-col items-center text-center py-12">
          <Image
            src="/brand/nudge-goblin.png"
            alt="Nudge, your invoicing assistant"
            width={168}
            height={168}
            className="rounded-3xl"
          />
          <div className="font-display text-xl mt-5" style={{ fontWeight: 700 }}>
            No invoices yet. Let&apos;s get you paid.
          </div>
          <div className="text-sm text-mute mt-1 max-w-xs">
            Send your first one. If it goes quiet, I&apos;ll follow up with the
            client for you.
          </div>
        </div>
      )}

      <ul>
        {invoices.map((inv) => {
          const chase = chaseLine(inv, agentActive);
          const chaseMuted =
            inv.status === "paid" ||
            !agentActive ||
            chase === "Final notice sent";
          return (
            <li
              key={inv.id}
              className="flex items-center justify-between py-4 border-b border-rule gap-3"
            >
              <span
                aria-label="Email"
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-paper"
                style={{ background: "#0a0a0a" }}
              >
                <Mail size={13} strokeWidth={1.8} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {inv.clientName}
                </div>
                <div className="text-xs text-mute mt-0.5 truncate">
                  {inv.id} · {inv.date}
                </div>
                {chase && (
                  <div
                    className="text-xs mt-0.5 truncate"
                    style={{
                      color: chaseMuted
                        ? "var(--color-mute)"
                        : "var(--color-paid-deep)",
                    }}
                  >
                    {chase}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">
                  {formatMoney(inv.amount, inv.currency)}
                </div>
                <div
                  className="text-[10px] uppercase tracking-widest mt-0.5 flex items-center gap-2 justify-end"
                  style={{
                    color:
                      inv.status === "paid"
                        ? "var(--color-paid)"
                        : "var(--color-mute)",
                  }}
                >
                  {inv.status}
                  <a
                    href={`/api/v1/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-widest text-mute hover:text-ink"
                    aria-label={`View ${inv.id} PDF`}
                  >
                    PDF
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <Link
          href="/app/new"
          className="w-full h-14 bg-ink text-paper flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-transform active:translate-x-[2px] active:translate-y-[2px]"
          style={{ boxShadow: "4px 4px 0 var(--color-paid)" }}
        >
          <Plus size={16} />
          Send invoice
        </Link>
      </div>
    </div>
  );
}

function bucketByCurrency(invoices: Invoice[]) {
  const map = new Map<CurrencyCode, number>();
  for (const inv of invoices) {
    map.set(inv.currency, (map.get(inv.currency) ?? 0) + inv.amount);
  }
  return Array.from(map.entries()).map(([currency, amount]) => ({
    currency,
    amount,
  }));
}
