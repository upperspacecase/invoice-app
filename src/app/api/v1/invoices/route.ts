import { authenticate, authError } from "@/lib/server/auth";
import { createInvoice, listInvoices } from "@/lib/server/store";
import { isCurrencyCode } from "@/lib/currency";
import type { CurrencyCode, DeliveryChannel, InvoiceStatus } from "@/lib/types";

const DELIVERY: ReadonlyArray<DeliveryChannel> = [
  "email",
  "quickbooks",
  "xero",
  "slack",
  "webhook",
  "portal",
];

function isDelivery(v: unknown): v is DeliveryChannel {
  return typeof v === "string" && DELIVERY.includes(v as DeliveryChannel);
}

function isStatus(v: unknown): v is InvoiceStatus {
  return v === "sent" || v === "paid";
}

export async function GET(req: Request) {
  const auth = authenticate(req);
  if (!auth.ok) return authError(auth);
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const clientId = url.searchParams.get("clientId");
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  let result = listInvoices();
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
  const auth = authenticate(req);
  if (!auth.ok) return authError(auth);

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
  if (b.channelOverride !== undefined && !isDelivery(b.channelOverride)) {
    return Response.json({ error: "Bad channel." }, { status: 400 });
  }

  const inv = createInvoice({
    clientId: b.clientId,
    amount,
    description:
      typeof b.description === "string" && b.description.trim()
        ? b.description.trim()
        : "Services rendered",
    currency: isCurrencyCode(b.currency) ? (b.currency as CurrencyCode) : undefined,
    channelOverride: isDelivery(b.channelOverride) ? b.channelOverride : undefined,
    actor: "agent",
  });
  if (!inv) {
    return Response.json({ error: "Client not found." }, { status: 404 });
  }
  return Response.json({ invoice: inv }, { status: 201 });
}
