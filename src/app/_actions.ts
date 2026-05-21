"use server";

import { revalidatePath } from "next/cache";
import {
  createApiKey,
  createClient,
  deleteApiKey,
  getBusiness,
  listApiKeys,
  markInvoicePaid,
  setAutomationEnabled,
  setDefaultCurrency,
  setIntegrationConnected,
  updateBusiness,
  updateClient,
  voteForFeature,
} from "@/lib/server/store";
import { sendInvoice, sendInvoiceReminder } from "@/lib/server/dispatch";
import { requireSession } from "@/lib/server/auth";
import { isCurrencyCode } from "@/lib/currency";
import { FEATURES, type FeatureId } from "@/lib/features";
import type {
  AutomationId,
  Business,
  CurrencyCode,
  DeliveryChannel,
  IntegrationId,
} from "@/lib/types";

function isFeatureId(v: unknown): v is FeatureId {
  return typeof v === "string" && v in FEATURES;
}

// Every feature ships on the single 1% plan, so the only gate left is whether
// the feature is actually built yet.
function requireFeature(feature: FeatureId): void {
  const meta = FEATURES[feature];
  if (!meta.built) {
    throw new Error(`${meta.name} isn't built yet — vote to prioritise.`);
  }
}

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
  const { uid } = await requireSession();
  requireFeature("multi-currency");
  const next = await setDefaultCurrency(uid, code);
  refreshAll();
  return next;
}

export async function updateBusinessAction(patch: Partial<Business>) {
  if (patch.currency && !isCurrencyCode(patch.currency)) {
    throw new Error("Bad currency");
  }
  const { uid } = await requireSession();
  const next = await updateBusiness(uid, patch);
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
  const { uid } = await requireSession();
  const client = await createClient(uid, input);
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
  const { uid } = await requireSession();
  const next = await updateClient(uid, id, patch);
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
  const { uid } = await requireSession();
  const business = await getBusiness(uid);
  if (input.currency && input.currency !== business.currency) {
    requireFeature("multi-currency");
  }
  if (
    input.channelOverride &&
    input.channelOverride !== "email" &&
    input.channelOverride !== "portal"
  ) {
    requireFeature("integrations");
  }
  const inv = await sendInvoice(uid, input);
  if (!inv) throw new Error("Client not found");
  refreshAll();
  return inv;
}

export async function markInvoicePaidAction(id: string) {
  const { uid } = await requireSession();
  const inv = await markInvoicePaid(uid, id, "you");
  if (!inv) throw new Error("Invoice not found");
  refreshAll();
  return inv;
}

export async function remindInvoiceAction(id: string) {
  const { uid } = await requireSession();
  const inv = await sendInvoiceReminder(uid, id, "you");
  if (!inv) throw new Error("Invoice not found");
  refreshAll();
  return inv;
}

// ---------- integrations ----------

export async function connectIntegrationAction(
  id: IntegrationId,
  account?: string
) {
  const { uid } = await requireSession();
  requireFeature("integrations");
  const next = await setIntegrationConnected(uid, id, true, account);
  if (!next) throw new Error("Unknown integration");
  refreshAll();
  return next;
}

export async function disconnectIntegrationAction(id: IntegrationId) {
  const { uid } = await requireSession();
  requireFeature("integrations");
  const next = await setIntegrationConnected(uid, id, false);
  if (!next) throw new Error("Unknown integration");
  refreshAll();
  return next;
}

// ---------- automations ----------

const AUTOMATION_FEATURE: Record<AutomationId, FeatureId> = {
  "auto-remind": "auto-reminders",
  "auto-mark-paid": "auto-mark-paid",
  "weekly-summary": "weekly-summary",
  "agent-approval": "agent-approval",
};

export async function setAutomationAction(id: AutomationId, enabled: boolean) {
  const { uid } = await requireSession();
  const feature = AUTOMATION_FEATURE[id];
  if (feature) requireFeature(feature);
  const next = await setAutomationEnabled(uid, id, enabled);
  if (!next) throw new Error("Unknown automation");
  refreshAll();
  return next;
}

// ---------- API keys ----------

export async function createApiKeyAction(name: string) {
  if (!name.trim()) throw new Error("Key name is required");
  const { uid } = await requireSession();
  requireFeature("agent-api");
  const created = await createApiKey(uid, name.trim());
  refreshAll();
  return created;
}

export async function deleteApiKeyAction(id: string) {
  const { uid } = await requireSession();
  requireFeature("agent-api");
  const ok = await deleteApiKey(uid, id);
  if (!ok) throw new Error("Key not found");
  refreshAll();
  return { id };
}

export async function listApiKeysAction() {
  const { uid } = await requireSession();
  return listApiKeys(uid);
}

// ---------- features ----------

export async function voteForFeatureAction(id: FeatureId) {
  if (!isFeatureId(id)) throw new Error("Unknown feature");
  const { uid } = await requireSession();
  const result = await voteForFeature(uid, id);
  refreshAll();
  return result;
}

// ---------- stripe ----------

export async function startStripeConnectAction(): Promise<
  { ok: true; url: string } | { ok: false; reason: string }
> {
  const session = await requireSession();
  const business = await getBusiness(session.uid);
  const { startConnectFlow } = await import("@/lib/stripe/connect");
  const flow = await startConnectFlow({
    uid: session.uid,
    email: business.email,
    businessName: business.name,
    existingAccountId: business.stripeAccountId,
  });
  if (!flow.ok) return { ok: false, reason: flow.detail };
  if (!business.stripeAccountId) {
    await updateBusiness(session.uid, { stripeAccountId: flow.accountId });
  }
  return { ok: true, url: flow.onboardingUrl };
}
