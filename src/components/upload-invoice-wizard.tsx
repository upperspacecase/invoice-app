"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, Check, Upload } from "lucide-react";
import { CURRENCIES, formatMoney } from "@/lib/currency";
import { chasePlan, formatChaseDate, DEFAULT_TERMS_DAYS } from "@/lib/followup-cadence";
import { netPreview } from "@/lib/fee-preview";
import { registerUploadedInvoiceAction } from "@/app/_actions";
import type { Business, Client, CurrencyCode, Invoice } from "@/lib/types";
import type { ExtractedInvoiceFields } from "@/lib/extract-invoice";

const DAY = 24 * 60 * 60 * 1000;
const MAX_BYTES = 4 * 1024 * 1024;

function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
function fromDateInput(s: string): number {
  return new Date(`${s}T00:00:00`).getTime();
}
// Module-level so the Date.now() reads stay out of component render scope.
function defaultDueInput(): string {
  return toDateInput(Date.now() + DEFAULT_TERMS_DAYS * DAY);
}
function todayInput(): string {
  return toDateInput(Date.now());
}

type Step = "pick" | "parsing" | "confirm" | "done";

export function UploadInvoiceWizard({
  business,
  clients,
  agentActive,
}: {
  business: Business;
  clients: Client[];
  agentActive: boolean;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // confirm-step fields
  const [uploadId, setUploadId] = useState("");
  const [clientChoice, setClientChoice] = useState<string>(""); // client id, or "" = new
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(business.currency);
  const [description, setDescription] = useState("");
  const [externalNumber, setExternalNumber] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueInput);
  const [alreadySent, setAlreadySent] = useState(false);
  const [sentDate, setSentDate] = useState(todayInput);
  const [sent, setSent] = useState<Invoice | null>(null);

  function prefill(fields: ExtractedInvoiceFields | null) {
    if (!fields) return;
    const match =
      fields.clientEmail &&
      clients.find(
        (c) => c.email.toLowerCase() === fields.clientEmail!.toLowerCase()
      );
    if (match) setClientChoice(match.id);
    else {
      setClientChoice("");
      if (fields.clientName) setNewName(fields.clientName);
      if (fields.clientEmail) setNewEmail(fields.clientEmail);
    }
    if (fields.amount) setAmount(String(fields.amount));
    if (fields.currency) setCurrency(fields.currency);
    if (fields.description) setDescription(fields.description);
    if (fields.invoiceNumber) setExternalNumber(fields.invoiceNumber);
    if (fields.dueDate && !Number.isNaN(Date.parse(fields.dueDate))) {
      setDueDate(toDateInput(Date.parse(fields.dueDate)));
    }
    if (fields.issueDate && !Number.isNaN(Date.parse(fields.issueDate))) {
      setSentDate(toDateInput(Date.parse(fields.issueDate)));
    }
  }

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF.");
      return;
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      setError("PDF must be under 4 MB.");
      return;
    }
    setStep("parsing");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/parse", { method: "POST", body });
      const data = (await res.json()) as {
        uploadId?: string;
        fields?: ExtractedInvoiceFields | null;
        error?: string;
      };
      if (!res.ok || !data.uploadId) {
        setError(data.error || "Couldn't read that file.");
        setStep("pick");
        return;
      }
      setUploadId(data.uploadId);
      prefill(data.fields ?? null);
      setStep("confirm");
    } catch {
      setError("Upload failed — try again.");
      setStep("pick");
    }
  }

  function register() {
    const amt = parseFloat(amount || "0");
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Enter the invoice amount.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const inv = await registerUploadedInvoiceAction({
          clientId: clientChoice || undefined,
          newClient: clientChoice ? undefined : { name: newName, email: newEmail },
          amount: amt,
          currency,
          description: description || "Services rendered",
          dueAt: fromDateInput(dueDate),
          externalNumber: externalNumber.trim() || undefined,
          uploadId,
          alreadySent,
          sentAt: alreadySent ? fromDateInput(sentDate) : undefined,
        });
        setSent(inv);
        setStep("done");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not register the invoice.");
      }
    });
  }

  return (
    <div className="pt-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => (step === "confirm" ? setStep("pick") : router.push("/app/new"))}
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h1
          className="font-display text-3xl sm:text-4xl leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Upload an invoice
        </h1>
      </div>

      {step === "pick" && (
        <div>
          <p className="text-sm text-mute mb-6 max-w-md">
            Drop the PDF you already made. Nudge reads it, you confirm the
            details, and it takes over the chasing.
          </p>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileInput.current?.click()}
            className="border-2 border-dashed border-rule rounded-2xl p-12 flex flex-col items-center text-center cursor-pointer hover:border-ink/40 transition-colors"
          >
            <Upload size={28} className="text-mute mb-3" />
            <div className="font-medium">Drop a PDF here, or click to choose</div>
            <div className="text-xs text-mute mt-1">PDF up to 4 MB</div>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
          {error && <div className="mt-4 text-xs text-danger">{error}</div>}
        </div>
      )}

      {step === "parsing" && (
        <div className="flex flex-col items-center text-center py-16">
          <Image
            src="/brand/nudge-goblin.png"
            alt="Nudge"
            width={120}
            height={120}
            className="rounded-3xl mb-5 animate-pulse"
          />
          <div className="font-display text-xl" style={{ fontWeight: 700 }}>
            Nudge is reading it…
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-5 max-w-lg">
          <p className="text-sm text-mute">
            Check the details Nudge pulled out, then choose what happens next.
          </p>

          <Field label="Client">
            <select
              value={clientChoice}
              onChange={(e) => setClientChoice(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
            >
              <option value="">+ New client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </Field>

          {!clientChoice && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="Client name"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder="billing@client.co"
                />
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full bg-transparent outline-none text-sm font-mono"
                placeholder="0.00"
              />
            </Field>
            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-transparent outline-none text-sm"
              >
                {CURRENCIES.map((cu) => (
                  <option key={cu.code} value={cu.code}>
                    {cu.code}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice number">
              <input
                value={externalNumber}
                onChange={(e) => setExternalNumber(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-mono"
                placeholder="#1268"
              />
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>
          </div>

          <Field label="For">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="What's the work?"
            />
          </Field>

          <label className="flex items-center gap-3 p-4 rounded-xl border border-rule bg-card cursor-pointer">
            <input
              type="checkbox"
              checked={alreadySent}
              onChange={(e) => setAlreadySent(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              I&apos;ve already sent this to the client
              <span className="block text-xs text-mute">
                Nudge won&apos;t email a duplicate — it just picks up the
                follow-ups.
              </span>
            </span>
          </label>

          {alreadySent && (
            <Field label="When did you send it?">
              <input
                type="date"
                value={sentDate}
                onChange={(e) => setSentDate(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>
          )}

          {error && <div className="text-xs text-danger">{error}</div>}

          <button
            type="button"
            onClick={register}
            disabled={pending}
            className="w-full h-14 bg-ink text-paper flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
          >
            {pending
              ? "Working…"
              : alreadySent
              ? "Start chasing"
              : "Send and chase"}
          </button>
        </div>
      )}

      {step === "done" && sent && (
        <UploadDone invoice={sent} agentActive={agentActive} alreadySent={alreadySent} />
      )}
    </div>
  );
}

function UploadDone({
  invoice,
  agentActive,
  alreadySent,
}: {
  invoice: Invoice;
  agentActive: boolean;
  alreadySent: boolean;
}) {
  const router = useRouter();
  const plan = chasePlan(invoice);
  const fees = netPreview(invoice.amount, invoice.currency);
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-20 text-center">
      <Image
        src="/brand/nudge-goblin.png"
        alt="Nudge"
        width={150}
        height={150}
        className="rounded-3xl mb-6"
      />
      <h1 className="font-display text-4xl sm:text-5xl leading-tight" style={{ fontWeight: 800 }}>
        {alreadySent ? "On it." : "Sent it. I'll chase 'em."}
      </h1>
      <p className="text-sm text-mute mt-3 mb-2 max-w-xs">
        {formatMoney(invoice.amount, invoice.currency)} on{" "}
        {invoice.externalNumber || invoice.id}
      </p>
      <p className="text-[13px] text-mute mb-8 max-w-xs">
        You&apos;ll receive ~{formatMoney(fees.net, invoice.currency)} after card
        fees.
      </p>

      {agentActive && (
        <div className="w-full max-w-xs text-left border border-rule bg-card mb-10">
          <div className="px-4 py-2.5 border-b border-rule text-[10px] uppercase tracking-widest text-mute font-mono">
            The plan
          </div>
          {plan.map((row, i) => (
            <div
              key={row.stage}
              className={`px-4 py-2.5 flex items-center justify-between text-sm ${
                i < plan.length - 1 ? "border-b border-rule" : ""
              }`}
            >
              <span>{row.label}</span>
              <span className="font-mono text-xs text-mute">
                {formatChaseDate(row.at)}
              </span>
            </div>
          ))}
          <div className="px-4 py-2.5 border-t border-rule text-xs text-mute">
            I stop the moment it&apos;s paid.
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <a
          href={`/api/v1/invoices/${invoice.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-md border border-rule text-sm hover:border-ink/40"
        >
          View PDF
        </a>
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="px-5 py-2.5 rounded-md bg-ink/[0.06] text-sm hover:bg-ink/10 transition-colors inline-flex items-center gap-1.5"
        >
          <Check size={14} /> Done
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-2 border-b border-rule">
      <div className="text-[11px] uppercase tracking-widest text-mute mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}
