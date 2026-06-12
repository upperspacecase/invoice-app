import { apiAuthError, authenticateApi } from "@/lib/server/auth";
import { listInvoices } from "@/lib/server/store";
import { sendInvoice } from "@/lib/server/dispatch";
import { isCurrencyCode } from "@/lib/currency";
import type { CurrencyCode, InvoiceStatus } from "@/lib/types";

function isStatus(v: unknown): v is InvoiceStatus {
  return v === "sent" || v === "paid";
}

export async function GET(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return apiAuthError(auth);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const clientId = url.searchParams.get("clientId");
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  let result = await listInvoices(auth.uid);
  if (status && isStatus(status)) {
    result = result.filter((i) => i.status === status);
  }
  if (clientId) {
    result = result.filter((i) => i.clientId === clientId);
  }
  if (Number.isFinite(limit) && limit > 0) {
    result = result.slice(0, limit);
  }
  return Response.json({ invoices: result });
}

export async function POST(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return apiAuthError(auth);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Body must be a JSON object." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  if (typeof b.clientId !== "string" || !b.clientId.trim()) {
    return Response.json({ error: "clientId is required." }, { status: 400 });
  }
  const amount =
    typeof b.amount === "number"
      ? b.amount
      : typeof b.amount === "string"
      ? parseFloat(b.amount)
      : NaN;
  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json(
      { error: "amount must be a positive number." },
      { status: 400 }
    );
  }
  if (b.currency !== undefined && !isCurrencyCode(b.currency)) {
    return Response.json({ error: "Bad currency." }, { status: 400 });
  }
  // Payment terms: either termsDays (int 0–365) or an explicit dueAt (ms,
  // within a sane window). termsDays wins if both are sent.
  let termsDays: number | undefined;
  let dueAt: number | undefined;
  if (b.termsDays !== undefined) {
    const t = typeof b.termsDays === "number" ? b.termsDays : NaN;
    if (!Number.isInteger(t) || t < 0 || t > 365) {
      return Response.json({ error: "termsDays must be 0–365." }, { status: 400 });
    }
    termsDays = t;
  } else if (b.dueAt !== undefined) {
    const d = typeof b.dueAt === "number" ? b.dueAt : NaN;
    const min = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const max = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(d) || d < min || d > max) {
      return Response.json({ error: "dueAt is out of range." }, { status: 400 });
    }
    dueAt = d;
  }

  const inv = await sendInvoice(auth.uid, {
    clientId: b.clientId,
    amount,
    description:
      typeof b.description === "string" && b.description.trim()
        ? b.description.trim()
        : "Services rendered",
    currency: isCurrencyCode(b.currency) ? (b.currency as CurrencyCode) : undefined,
    termsDays,
    dueAt,
    actor: "agent",
  });
  if (!inv) {
    return Response.json({ error: "Client not found." }, { status: 404 });
  }
  return Response.json({ invoice: inv }, { status: 201 });
}
