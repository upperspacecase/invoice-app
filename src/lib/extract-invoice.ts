import "server-only";
import { isCurrencyCode } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/types";

// Reads an uploaded invoice PDF with Claude and returns the fields we can
// prefill. Mirrors the raw-fetch pattern in followup-copy.ts (no SDK). Returns
// null on ANY failure (no key, timeout, bad JSON) — the UI then falls back to
// manual entry. NEVER throws.
const MODEL = "claude-haiku-4-5-20251001";

export type ExtractedInvoiceFields = {
  clientName: string | null;
  clientEmail: string | null;
  amount: number | null;
  currency: CurrencyCode | null;
  invoiceNumber: string | null;
  issueDate: string | null; // ISO yyyy-mm-dd
  dueDate: string | null; // ISO yyyy-mm-dd
  description: string | null;
};

const PROMPT =
  "Extract these fields from this invoice PDF and reply with a SINGLE JSON object, no prose, no code fences. " +
  "Keys: clientName, clientEmail, amount (number, the total due, no currency symbol), currency (3-letter ISO code), " +
  "invoiceNumber (the document's own number, e.g. \"#1268\"), issueDate (yyyy-mm-dd), dueDate (yyyy-mm-dd), description (the work, one short line). " +
  "Use null for anything you cannot find. The client is the BILL-TO party (the customer), not the sender.";

export async function extractInvoiceFields(
  pdf: Buffer
): Promise<ExtractedInvoiceFields | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdf.toString("base64"),
                },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = (json.content ?? [])
      .filter((b) => b?.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("\n");
    return parseFields(text);
  } catch {
    return null;
  }
}

// Exported for testing. Strips code fences, parses, and coerces each field
// defensively. Returns null if the JSON can't be parsed at all.
export function parseFields(raw: string): ExtractedInvoiceFields | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;

  const str = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  const coerceAmount = (v: unknown): number | null => {
    if (typeof v === "number") return Number.isFinite(v) && v > 0 ? v : null;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/[^0-9.]/g, ""));
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
  };
  const amount = coerceAmount(obj.amount);
  const currency = isCurrencyCode(obj.currency)
    ? (obj.currency as CurrencyCode)
    : null;
  const isoDate = (v: unknown): string | null => {
    const s = str(v);
    if (!s) return null;
    return Number.isNaN(Date.parse(s)) ? null : s;
  };

  return {
    clientName: str(obj.clientName),
    clientEmail: str(obj.clientEmail),
    amount: amount && Number.isFinite(amount) ? amount : null,
    currency,
    invoiceNumber: str(obj.invoiceNumber),
    issueDate: isoDate(obj.issueDate),
    dueDate: isoDate(obj.dueDate),
    description: str(obj.description),
  };
}
