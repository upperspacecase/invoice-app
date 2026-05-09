import "server-only";
import { randomBytes, createHash } from "node:crypto";
import type {
  ActivityActor,
  ActivityEvent,
  ApiKey,
  AppState,
  AutomationId,
  Business,
  Client,
  CurrencyCode,
  DeliveryChannel,
  IntegrationId,
  Invoice,
} from "../types";
import {
  formatLabel,
  initialActivity,
  initialApiKeys,
  initialAutomations,
  initialBusiness,
  initialClients,
  initialIntegrations,
  initialInvoices,
  nextInvoiceId,
} from "../demo-data";

declare global {
  // Persist the store across hot reloads in dev.
  var __invoiceAppStore: AppState | undefined;
}

function seed(): AppState {
  return {
    business: { ...initialBusiness },
    clients: initialClients.map((c) => ({ ...c })),
    invoices: initialInvoices.map((i) => ({ ...i })),
    integrations: initialIntegrations.map((i) => ({ ...i })),
    apiKeys: initialApiKeys.map((k) => ({ ...k })),
    automations: initialAutomations.map((a) => ({ ...a })),
    activity: initialActivity.map((e) => ({ ...e })),
  };
}

const state: AppState =
  globalThis.__invoiceAppStore ?? (globalThis.__invoiceAppStore = seed());

function snapshot<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export function getState(): AppState {
  return snapshot(state);
}

function pushActivity(
  who: ActivityActor,
  text: string,
  meta: string
): ActivityEvent {
  const ev: ActivityEvent = {
    id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    who,
    text,
    meta,
    at: Date.now(),
  };
  state.activity = [ev, ...state.activity];
  return ev;
}

export function logActivity(
  who: ActivityActor,
  text: string,
  meta = ""
): ActivityEvent {
  return snapshot(pushActivity(who, text, meta));
}

// ---------- business ----------

export function updateBusiness(patch: Partial<Business>): Business {
  state.business = { ...state.business, ...patch };
  return snapshot(state.business);
}

export function setDefaultCurrency(code: CurrencyCode): Business {
  if (state.business.currency === code) return snapshot(state.business);
  state.business.currency = code;
  pushActivity("you", `Set default currency to ${code}`, "settings.account");
  return snapshot(state.business);
}

// ---------- clients ----------

export function listClients(): Client[] {
  return snapshot(state.clients);
}

export function getClient(id: string): Client | null {
  const c = state.clients.find((c) => c.id === id);
  return c ? snapshot(c) : null;
}

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "client"
  );
}

function uniqueId(prefix: string, taken: Set<string>): string {
  if (!taken.has(prefix)) return prefix;
  let n = 2;
  while (taken.has(`${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

type CreateClientInput = {
  name: string;
  email: string;
  currency?: CurrencyCode;
  delivery?: DeliveryChannel;
  deliveryHandle?: string;
};

export function createClient(input: CreateClientInput): Client {
  const taken = new Set(state.clients.map((c) => c.id));
  const client: Client = {
    id: uniqueId(slug(input.name), taken),
    name: input.name,
    email: input.email,
    lastAmount: 0,
    currency: input.currency ?? state.business.currency,
    delivery: input.delivery ?? "email",
    deliveryHandle: input.deliveryHandle,
  };
  state.clients = [...state.clients, client];
  pushActivity("you", `Added client ${client.name}`, "client.create");
  return snapshot(client);
}

export function updateClient(
  id: string,
  patch: Partial<Omit<Client, "id">>
): Client | null {
  const idx = state.clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = { ...state.clients[idx], ...patch };
  state.clients = [
    ...state.clients.slice(0, idx),
    next,
    ...state.clients.slice(idx + 1),
  ];
  return snapshot(next);
}

// ---------- invoices ----------

export function listInvoices(): Invoice[] {
  return snapshot(state.invoices);
}

export function getInvoice(id: string): Invoice | null {
  const inv = state.invoices.find((i) => i.id === id);
  return inv ? snapshot(inv) : null;
}

type CreateInvoiceInput = {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
  channelOverride?: DeliveryChannel;
  actor?: ActivityActor;
};

export function createInvoice(input: CreateInvoiceInput): Invoice | null {
  const client = state.clients.find((c) => c.id === input.clientId);
  if (!client) return null;
  const channel = input.channelOverride ?? client.delivery;
  const currency = input.currency ?? client.currency;
  const id = nextInvoiceId(state.invoices);
  const now = Date.now();
  const invoice: Invoice = {
    id,
    clientId: client.id,
    clientName: client.name,
    clientEmail: client.email,
    amount: input.amount,
    currency,
    description: input.description,
    date: formatLabel(now),
    status: "sent",
    channel,
    sentAt: now,
  };
  state.invoices = [invoice, ...state.invoices];
  state.clients = state.clients.map((c) =>
    c.id === client.id ? { ...c, lastAmount: input.amount } : c
  );
  const channelLabel =
    channel === "email"
      ? `email to ${client.email}`
      : channel === "portal"
      ? "portal link"
      : channel.charAt(0).toUpperCase() + channel.slice(1);
  pushActivity(
    input.actor ?? "you",
    `Sent ${id} to ${client.name}`,
    `via ${channelLabel}`
  );
  return snapshot(invoice);
}

export function markInvoicePaid(
  id: string,
  actor: ActivityActor = "you"
): Invoice | null {
  const idx = state.invoices.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const inv = state.invoices[idx];
  if (inv.status === "paid") return snapshot(inv);
  const next: Invoice = { ...inv, status: "paid", paidAt: Date.now() };
  state.invoices = [
    ...state.invoices.slice(0, idx),
    next,
    ...state.invoices.slice(idx + 1),
  ];
  pushActivity(actor, `Marked ${id} paid`, "manual");
  return snapshot(next);
}

export function remindInvoice(
  id: string,
  actor: ActivityActor = "agent"
): Invoice | null {
  const idx = state.invoices.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const inv = state.invoices[idx];
  if (inv.status !== "sent") return snapshot(inv);
  const next: Invoice = { ...inv, lastReminderAt: Date.now() };
  state.invoices = [
    ...state.invoices.slice(0, idx),
    next,
    ...state.invoices.slice(idx + 1),
  ];
  pushActivity(actor, `Sent reminder for ${id}`, `to ${inv.clientName}`);
  return snapshot(next);
}

// ---------- integrations ----------

export function listIntegrations() {
  return snapshot(state.integrations);
}

export function setIntegrationConnected(
  id: IntegrationId,
  connected: boolean,
  account?: string
) {
  const idx = state.integrations.findIndex((it) => it.id === id);
  if (idx === -1) return null;
  const next = {
    ...state.integrations[idx],
    connected,
    account: connected ? account ?? `studio-ltd-${id}` : undefined,
    connectedAt: connected ? Date.now() : undefined,
  };
  state.integrations = [
    ...state.integrations.slice(0, idx),
    next,
    ...state.integrations.slice(idx + 1),
  ];
  pushActivity(
    "you",
    `${connected ? "Connected" : "Disconnected"} ${next.name}`,
    connected
      ? "OAuth flow stubbed for demo · scope: invoice.write"
      : "Disconnected"
  );
  return snapshot(next);
}

// ---------- automations ----------

export function listAutomations() {
  return snapshot(state.automations);
}

export function setAutomationEnabled(id: AutomationId, enabled: boolean) {
  const idx = state.automations.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const next = { ...state.automations[idx], enabled };
  state.automations = [
    ...state.automations.slice(0, idx),
    next,
    ...state.automations.slice(idx + 1),
  ];
  pushActivity(
    "you",
    `${enabled ? "Enabled" : "Disabled"} ${next.title.toLowerCase()}`,
    "settings.automations"
  );
  return snapshot(next);
}

// ---------- API keys ----------

export type CreatedApiKey = {
  meta: ApiKey;
  // Plaintext token, surfaced once.
  token: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function listApiKeys(): ApiKey[] {
  return snapshot(state.apiKeys);
}

export function createApiKey(name: string): CreatedApiKey {
  const raw = randomBytes(24).toString("base64url");
  const token = `sk_live_${raw}`;
  const prefix = `sk_live_•••• ${raw.slice(-4)}`;
  const meta: ApiKey = {
    id: `key_${Date.now().toString(36)}_${randomBytes(3).toString("hex")}`,
    name,
    prefix,
    tokenHash: hashToken(token),
    createdAt: Date.now(),
  };
  state.apiKeys = [meta, ...state.apiKeys];
  pushActivity("you", `Created API key "${name}"`, prefix);
  return { meta: snapshot(meta), token };
}

export function deleteApiKey(id: string): boolean {
  const target = state.apiKeys.find((k) => k.id === id);
  if (!target) return false;
  state.apiKeys = state.apiKeys.filter((k) => k.id !== id);
  pushActivity("you", `Revoked API key "${target.name}"`, target.prefix);
  return true;
}

export function findApiKeyByToken(token: string): ApiKey | null {
  const hash = hashToken(token);
  const key = state.apiKeys.find((k) => k.tokenHash === hash);
  return key ? snapshot(key) : null;
}

export function touchApiKey(id: string): void {
  const idx = state.apiKeys.findIndex((k) => k.id === id);
  if (idx === -1) return;
  state.apiKeys = [
    ...state.apiKeys.slice(0, idx),
    { ...state.apiKeys[idx], lastUsedAt: Date.now() },
    ...state.apiKeys.slice(idx + 1),
  ];
}

// ---------- activity ----------

export function listActivity(limit = 50): ActivityEvent[] {
  return snapshot(state.activity.slice(0, limit));
}
