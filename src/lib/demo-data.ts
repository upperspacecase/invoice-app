import type {
  ActivityEvent,
  ApiKey,
  Automation,
  Business,
  Client,
  Integration,
  Invoice,
} from "./types";

export const initialBusiness: Business = {
  name: "Studio Ltd",
  email: "hello@studio.co",
  payment: "Wise — IBAN GB29 NWBK 6016 1331 9268 19",
  company: "Company No. 12345678",
  currency: "USD",
};

export const initialClients: Client[] = [
  {
    id: "acme",
    name: "Acme Studios",
    email: "billing@acmestudios.co",
    lastAmount: 1250,
    currency: "USD",
    delivery: "quickbooks",
    deliveryHandle: "acme-studios-llc",
  },
  {
    id: "field-notes",
    name: "Field Notes Co",
    email: "hello@fieldnotes.co",
    lastAmount: 850,
    currency: "EUR",
    delivery: "slack",
    deliveryHandle: "#acme-billing",
  },
  {
    id: "forge",
    name: "Forge Atelier",
    email: "finance@forgeatelier.com",
    lastAmount: 3200,
    currency: "GBP",
    delivery: "email",
  },
];

const now = Date.now();
const day = 86_400_000;

export const initialInvoices: Invoice[] = [
  {
    id: "INV-014",
    clientId: "acme",
    clientName: "Acme Studios",
    clientEmail: "billing@acmestudios.co",
    amount: 1250,
    currency: "USD",
    description: "Strategy session, April",
    date: "Apr 28",
    status: "paid",
    channel: "quickbooks",
    sentAt: now - 11 * day,
    paidAt: now - 4 * day,
  },
  {
    id: "INV-013",
    clientId: "field-notes",
    clientName: "Field Notes Co",
    clientEmail: "hello@fieldnotes.co",
    amount: 850,
    currency: "EUR",
    description: "Editorial design, issue 04",
    date: "Apr 21",
    status: "sent",
    channel: "slack",
    sentAt: now - 18 * day,
  },
  {
    id: "INV-012",
    clientId: "forge",
    clientName: "Forge Atelier",
    clientEmail: "finance@forgeatelier.com",
    amount: 3200,
    currency: "GBP",
    description: "Brand identity, phase 2",
    date: "Apr 14",
    status: "paid",
    channel: "email",
    sentAt: now - 25 * day,
    paidAt: now - 12 * day,
  },
];

export const initialIntegrations: Integration[] = [
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Push invoices to client's QuickBooks",
    color: "#2CA01C",
    connected: true,
    account: "studio-ltd-main",
    connectedAt: now - 14 * day,
  },
  {
    id: "xero",
    name: "Xero",
    description: "Push invoices to client's Xero",
    color: "#13B5EA",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "DM the invoice into a Slack channel",
    color: "#4A154B",
    connected: true,
    account: "studio-ltd",
    connectedAt: now - 30 * day,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Attach a payment link to invoices",
    color: "#635BFF",
    connected: false,
  },
  {
    id: "webhook",
    name: "Webhook",
    description: "POST invoices to any URL",
    color: "#0a0a0a",
    connected: false,
  },
];

export const initialApiKeys: ApiKey[] = [];

export const initialAutomations: Automation[] = [
  {
    id: "auto-remind",
    title: "Auto-remind unpaid invoices",
    body: "Send a follow-up after 7 days, then 14, then 30.",
    enabled: true,
  },
  {
    id: "auto-mark-paid",
    title: "Auto-mark paid",
    body: "When Stripe webhook fires, flip status to paid.",
    enabled: true,
  },
  {
    id: "weekly-summary",
    title: "Weekly summary email",
    body: "Every Monday: outstanding total + overdue list.",
    enabled: false,
  },
  {
    id: "agent-approval",
    title: "Agent approval required",
    body: "Pause agent-drafted invoices for your review before sending.",
    enabled: false,
  },
];

export const initialActivity: ActivityEvent[] = [
  {
    id: "ev-1",
    who: "agent",
    text: "Sent reminder to Field Notes Co",
    meta: "via Slack #acme-billing",
    at: now - 2 * 60 * 1000,
  },
  {
    id: "ev-2",
    who: "you",
    text: "Marked INV-014 paid",
    meta: "manual",
    at: now - 3 * day,
  },
  {
    id: "ev-3",
    who: "agent",
    text: "Drafted INV-013 for Field Notes Co",
    meta: "€850 EUR · approved by you",
    at: now - 4 * day,
  },
  {
    id: "ev-4",
    who: "system",
    text: "Stripe webhook: payment for INV-014",
    meta: "checkout.session.completed",
    at: now - 5 * day,
  },
  {
    id: "ev-5",
    who: "agent",
    text: "Sent INV-012 to Forge Atelier via email",
    meta: "delivered · open tracking on",
    at: now - 25 * day,
  },
  {
    id: "ev-6",
    who: "you",
    text: "Connected QuickBooks",
    meta: "OAuth · scope: invoice.write",
    at: now - 14 * day,
  },
];

export function nextInvoiceId(invoices: Invoice[]): string {
  const numbers = invoices
    .map((inv) => parseInt(inv.id.replace(/\D/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 14;
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export function formatLabel(at: number): string {
  return new Date(at).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

// Re-exports kept so existing imports keep working until everything lands.
export type {
  ActivityEvent,
  ApiKey,
  Automation,
  Business,
  Client,
  CurrencyCode,
  DeliveryChannel,
  Integration,
  Invoice,
  InvoiceStatus,
} from "./types";
