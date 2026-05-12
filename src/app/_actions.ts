"use server";

import { revalidatePath } from "next/cache";
import {
  createApiKey,
  createClient,
  createInvoice,
  deleteApiKey,
  getBusiness,
  listApiKeys,
  markInvoicePaid,
  remindInvoice,
  setAutomationEnabled,
  setDefaultCurrency,
  setIntegrationConnected,
  setTier,
  updateBusiness,
  updateClient,
  voteForFeature,
} from "@/lib/server/store";
import { requireSession } from "@/lib/server/auth";
import { isCurrencyCode } from "@/lib/currency";
import { FEATURES, TIER_LABEL, type FeatureId } from "@/lib/features";
import { TIER_RANK, type Tier } from "@/lib/types";
import type {
  AutomationId,
  Business,
  CurrencyCode,
  DeliveryChannel,
  IntegrationId,
} from "@/lib/types";

const TIERS: ReadonlyArray<Tier> = ["send", "pro", "get-paid"];
function isTier(v: unknown): v is Tier {
  return typeof v === "string" && TIERS.includes(v as Tier);
}
function isFeatureId(v: unknown): v is FeatureId {
  return typeof v === "string" && v in FEATURES;
}

async function requireFeature(uid: string, feature: FeatureId): Promise<void> {
  const meta = FEATURES[feature];
  const business = await getBusiness(uid);
  if (TIER_RANK[business.tier] < TIER_RANK[meta.tier]) {
    throw new Error(`${meta.name} is part of ${TIER_LABEL[meta.tier]}.`);
  }
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
  await requireFeature(uid, "multi-currency");
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
    await requireFeature(uid, "multi-currency");
  }
  if (
    input.channelOverride &&
    input.channelOverride !== "email" &&
    input.channelOverride !== "portal"
  ) {
    await requireFeature(uid, "integrations");
  }
  const inv = await createInvoice(uid, input);
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
  const inv = await remindInvoice(uid, id, "you");
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
  await requireFeature(uid, "integrations");
  const next = await setIntegrationConnected(uid, id, true, account);
  if (!next) throw new Error("Unknown integration");
  refreshAll();
  return next;
}

export async function disconnectIntegrationAction(id: IntegrationId) {
  const { uid } = await requireSession();
  await requireFeature(uid, "integrations");
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
  if (feature) await requireFeature(uid, feature);
  const next = await setAutomationEnabled(uid, id, enabled);
  if (!next) throw new Error("Unknown automation");
  refreshAll();
  return next;
}

// ---------- API keys ----------

export async function createApiKeyAction(name: string) {
  if (!name.trim()) throw new Error("Key name is required");
  const { uid } = await requireSession();
  await requireFeature(uid, "agent-api");
  const created = await createApiKey(uid, name.trim());
  refreshAll();
  return created;
}

export async function deleteApiKeyAction(id: string) {
  const { uid } = await requireSession();
  await requireFeature(uid, "agent-api");
  const ok = await deleteApiKey(uid, id);
  if (!ok) throw new Error("Key not found");
  refreshAll();
  return { id };
}

export async function listApiKeysAction() {
  const { uid } = await requireSession();
  return listApiKeys(uid);
}

// ---------- tier / features ----------

export async function setTierAction(tier: Tier) {
  if (!isTier(tier)) throw new Error("Bad tier");
  const { uid } = await requireSession();
  const next = await setTier(uid, tier);
  refreshAll();
  return next;
}

export async function voteForFeatureAction(id: FeatureId) {
  if (!isFeatureId(id)) throw new Error("Unknown feature");
  const { uid } = await requireSession();
  const result = await voteForFeature(uid, id);
  refreshAll();
  return result;
}
