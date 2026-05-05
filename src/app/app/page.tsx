"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useDemo } from "@/components/demo-provider";

export default function LedgerPage() {
  const { business, invoices, ready } = useDemo();

  const outstanding = invoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + i.amount, 0);
  const unpaidCount = invoices.filter((i) => i.status === "sent").length;

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

      <div className="bg-ink text-paper rounded-2xl p-6 mb-10">
        <div className="text-xs uppercase tracking-widest text-paper/60">
          Outstanding
        </div>
        <div className="font-mono text-5xl mt-3" style={{ fontWeight: 300 }}>
          ${ready ? outstanding.toLocaleString() : "—"}
        </div>
        <div className="text-xs text-paper/60 mt-3">
          {unpaidCount} unpaid
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-mute mb-4">
          Recent
        </div>
        <ul>
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between py-4 border-b border-rule"
            >
              <div>
                <div className="text-sm font-medium">{inv.clientName}</div>
                <div className="text-xs text-mute mt-0.5">
                  {inv.id} · {inv.date}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">
                  ${inv.amount.toLocaleString()}
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
      </div>

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
