import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/server/auth";
import {
  listAutomations,
  listInvoices,
  getWorkspace,
} from "@/lib/server/store";
import { getRates, convertSync } from "@/lib/fx";
import { formatMoney } from "@/lib/currency";
import { channelLabel, ChannelIcon } from "@/components/channel-icon";
import type { CurrencyCode, Invoice } from "@/lib/types";

export default async function LedgerPage() {
  const { uid } = await requireSession();
  const [{ business, invoices }, automations, rates] = await Promise.all([
    getWorkspace(uid),
    listAutomations(uid),
    getRates(),
  ]);
  void listInvoices; // tree-shaking guard

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
  const agentActive = automations.find((a) => a.id === "auto-remind")?.enabled;

  return (
    <div className="pt-10 sm:pt-14">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-mute">
          Ledger
        </div>
        <h1
          className="font-serif text-4xl sm:text-5xl mt-1 leading-tight"
          style={{ fontWeight: 400 }}
        >
          {business.name}
        </h1>
      </div>

      <div className="bg-ink text-paper rounded-2xl p-6 mb-8">
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

      <ul>
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="flex items-center justify-between py-4 border-b border-rule gap-3"
          >
            <ChannelIcon channel={inv.channel} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {inv.clientName}
              </div>
              <div className="text-xs text-mute mt-0.5 truncate">
                {inv.id} · {inv.date} · {channelLabel(inv.channel)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono">
                {formatMoney(inv.amount, inv.currency)}
              </div>
              <div
                className="text-[10px] uppercase tracking-widest mt-0.5"
                style={{
                  color:
                    inv.status === "paid"
                      ? "var(--color-paid)"
                      : "var(--color-accent)",
                }}
              >
                {inv.status}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link
          href="/app/new"
          className="w-full h-14 rounded-xl bg-ink text-paper flex items-center justify-center gap-2 text-sm font-medium hover:bg-ink/90 transition-colors"
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
