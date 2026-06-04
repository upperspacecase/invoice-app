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
  name: "Apex Electrical",
  email: "jobs@apexelectrical.co",
  payment: "Bank transfer — 03-1234-5678901-00",
  company: "ABN 12 345 678 901",
  currency: "USD",
  tier: "get-paid",
  onboarded: true,
};

export const initialClients: Client[] = [
  {
    id: "coastline",
    name: "Coastline Builders",
    email: "accounts@coastlinebuilders.co",
    lastAmount: 4200,
    currency: "USD",
    delivery: "email",
  },
  {
    id: "harbour-pm",
    name: "Harbour Property Mgmt",
    email: "invoices@harbourpm.co",
    lastAmount: 1850,
    currency: "USD",
    delivery: "email",
  },
  {
    id: "whitaker",
    name: "M. Whitaker",
    email: "mwhitaker@gmail.com",
    lastAmount: 680,
    currency: "USD",
    delivery: "email",
  },
];

const now = Date.now();
const day = 86_400_000;

export const initialInvoices: Invoice[] = [
  {
    id: "INV-014",
    clientId: "coastline",
    clientName: "Coastline Builders",
    clientEmail: "accounts@coastlinebuilders.co",
    amount: 4200,
    currency: "USD",
    description: "Switchboard upgrade — 14 Oxford St",
    date: "Apr 28",
    status: "paid",
    channel: "email",
    sentAt: now - 11 * day,
    paidAt: now - 4 * day,
  },
  {
    id: "INV-013",
    clientId: "harbour-pm",
    clientName: "Harbour Property Mgmt",
    clientEmail: "invoices@harbourpm.co",
    amount: 1850,
    currency: "USD",
    description: "Rewire stage 2 — Harbour units 3–6",
    date: "Apr 21",
    status: "sent",
    channel: "email",
    sentAt: now - 18 * day,
  },
  {
    id: "INV-012",
    clientId: "whitaker",
    clientName: "M. Whitaker",
    clientEmail: "mwhitaker@gmail.com",
    amount: 680,
    currency: "USD",
    description: "Hot water system install",
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
    body: "Send a follow-up if an invoice is still unpaid after 7 days.",
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
    text: "Nudged Harbour Property Mgmt on INV-013",
    meta: "unpaid 18 days · follow-up sent",
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
    text: "Drafted INV-013 for Harbour Property Mgmt",
    meta: "$1,850 · approved by you",
    at: now - 4 * day,
  },
  {
    id: "ev-4",
    who: "system",
    text: "Stripe: payment landed for INV-014",
    meta: "1% fee · $42.00",
    at: now - 5 * day,
  },
  {
    id: "ev-5",
    who: "agent",
    text: "Sent INV-012 to M. Whitaker",
    meta: "delivered · pay link attached",
    at: now - 25 * day,
  },
  {
    id: "ev-6",
    who: "you",
    text: "Connected Stripe",
    meta: "payouts to your bank",
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
  Tier,
} from "./types";
