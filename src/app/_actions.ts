"use server";

import { revalidatePath } from "next/cache";
import {
  createApiKey,
  createClient,
  createInvoice,
  deleteApiKey,
  listApiKeys,
  markInvoicePaid,
  remindInvoice,
  setAutomationEnabled,
  setDefaultCurrency,
  setIntegrationConnected,
  updateBusiness,
  updateClient,
} from "@/lib/server/store";
import { isCurrencyCode } from "@/lib/currency";
import type {
  AutomationId,
  Business,
  CurrencyCode,
  DeliveryChannel,
  IntegrationId,
} from "@/lib/types";

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

function refreshAll() {
  revalidatePath("/", "layout");
}

// ---------- business / currency ----------

export async function setDefaultCurrencyAction(code: CurrencyCode) {
  if (!isCurrencyCode(code)) throw new Error("Bad currency");
  const next = setDefaultCurrency(code);
  refreshAll();
  return next;
}

export async function updateBusinessAction(patch: Partial<Business>) {
  if (patch.currency && !isCurrencyCode(patch.currency)) {
    throw new Error("Bad currency");
  }
  const next = updateBusiness(patch);
  refreshAll();
  return next;
}

// ---------- clients ----------

export async function createClientAction(input: {
  name: string;
  email: string;
  currency?: CurrencyCode;
  delivery?: DeliveryChannel;
  deliveryHandle?: string;
}) {
  if (!input.name.trim()) throw new Error("Name is required");
  if (!input.email.trim()) throw new Error("Email is required");
  if (input.currency && !isCurrencyCode(input.currency)) {
    throw new Error("Bad currency");
  }
  if (input.delivery && !isDelivery(input.delivery)) {
    throw new Error("Bad delivery");
  }
  const client = createClient(input);
  refreshAll();
  return client;
}

export async function updateClientAction(
  id: string,
  patch: {
    name?: string;
    email?: string;
    currency?: CurrencyCode;
    delivery?: DeliveryChannel;
    deliveryHandle?: string;
  }
) {
  if (patch.currency && !isCurrencyCode(patch.currency)) {
    throw new Error("Bad currency");
  }
  if (patch.delivery && !isDelivery(patch.delivery)) {
    throw new Error("Bad delivery");
  }
  const next = updateClient(id, patch);
  if (!next) throw new Error("Client not found");
  refreshAll();
  return next;
}

// ---------- invoices ----------

export async function createInvoiceAction(input: {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
  channelOverride?: DeliveryChannel;
}) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be > 0");
  }
  if (input.currency && !isCurrencyCode(input.currency)) {
    throw new Error("Bad currency");
  }
  if (input.channelOverride && !isDelivery(input.channelOverride)) {
    throw new Error("Bad channel");
  }
  const inv = createInvoice(input);
  if (!inv) throw new Error("Client not found");
  refreshAll();
  return inv;
}

export async function markInvoicePaidAction(id: string) {
  const inv = markInvoicePaid(id, "you");
  if (!inv) throw new Error("Invoice not found");
  refreshAll();
  return inv;
}

export async function remindInvoiceAction(id: string) {
  const inv = remindInvoice(id, "you");
  if (!inv) throw new Error("Invoice not found");
  refreshAll();
  return inv;
}

// ---------- integrations ----------

export async function connectIntegrationAction(
  id: IntegrationId,
  account?: string
) {
  const next = setIntegrationConnected(id, true, account);
  if (!next) throw new Error("Unknown integration");
  refreshAll();
  return next;
}

export async function disconnectIntegrationAction(id: IntegrationId) {
  const next = setIntegrationConnected(id, false);
  if (!next) throw new Error("Unknown integration");
  refreshAll();
  return next;
}

// ---------- automations ----------

export async function setAutomationAction(id: AutomationId, enabled: boolean) {
  const next = setAutomationEnabled(id, enabled);
  if (!next) throw new Error("Unknown automation");
  refreshAll();
  return next;
}

// ---------- API keys ----------

export async function createApiKeyAction(name: string) {
  if (!name.trim()) throw new Error("Key name is required");
  const created = createApiKey(name.trim());
  refreshAll();
  return created;
}

export async function deleteApiKeyAction(id: string) {
  const ok = deleteApiKey(id);
  if (!ok) throw new Error("Key not found");
  refreshAll();
  return { id };
}

export async function listApiKeysAction() {
  return listApiKeys();
}
