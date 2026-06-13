import Link from "next/link";
import { ArrowLeft, FilePlus2, Upload } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";

export default async function NewInvoiceChooser() {
  await requireOnboardedSession();
  return (
    <div className="pt-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/app"
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1
          className="font-display text-3xl sm:text-4xl leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          New invoice
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/app/new/create"
          className="p-6 rounded-2xl border border-rule bg-card hover:border-ink/30 transition-colors flex flex-col gap-3"
        >
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-paper"
            style={{ background: "var(--color-ink)" }}
            aria-hidden
          >
            <FilePlus2 size={20} />
          </span>
          <div className="font-display text-lg" style={{ fontWeight: 700 }}>
            Create with Nudge
          </div>
          <div className="text-sm text-mute leading-relaxed">
            Build the invoice here in a few taps — pay link and follow-ups
            included.
          </div>
        </Link>

        <Link
          href="/app/new/upload"
          className="p-6 rounded-2xl border border-rule bg-card hover:border-ink/30 transition-colors flex flex-col gap-3"
        >
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-paper"
            style={{ background: "var(--color-paid)" }}
            aria-hidden
          >
            <Upload size={20} />
          </span>
          <div className="font-display text-lg" style={{ fontWeight: 700 }}>
            Upload an invoice
          </div>
          <div className="text-sm text-mute leading-relaxed">
            Already made it elsewhere? Hand Nudge the PDF and it&apos;ll chase
            it for you.
          </div>
        </Link>
      </div>
    </div>
  );
}
