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
  updateBusiness,
  updateClient,
} from "@/lib/server/store";
import {
  registerUploadedInvoice,
  sendInvoice,
  sendNextReminder,
} from "@/lib/server/dispatch";
import { requireSession } from "@/lib/server/auth";
import { isCurrencyCode } from "@/lib/currency";
import type { AutomationId, Business, CurrencyCode } from "@/lib/types";

const AUTOMATION_IDS: ReadonlyArray<AutomationId> = [
  "auto-remind",
  "auto-mark-paid",
  "weekly-summary",
  "agent-approval",
];
function isAutomationId(v: unknown): v is AutomationId {
  return typeof v === "string" && AUTOMATION_IDS.includes(v as AutomationId);
}

function refreshAll() {
  revalidatePath("/", "layout");
}

// ---------- business / currency ----------

export async function setDefaultCurrencyAction(code: CurrencyCode) {
  if (!isCurrencyCode(code)) throw new Error("Bad currency");
  const { uid } = await requireSession();
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
}) {
  if (!input.name.trim()) throw new Error("Name is required");
  if (!input.email.trim()) throw new Error("Email is required");
  if (input.currency && !isCurrencyCode(input.currency)) {
    throw new Error("Bad currency");
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
  }
) {
  if (patch.currency && !isCurrencyCode(patch.currency)) {
    throw new Error("Bad currency");
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
  termsDays?: number;
}) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be > 0");
  }
  if (input.currency && !isCurrencyCode(input.currency)) {
    throw new Error("Bad currency");
  }
  if (
    input.termsDays != null &&
    (!Number.isInteger(input.termsDays) ||
      input.termsDays < 0 ||
      input.termsDays > 365)
  ) {
    throw new Error("Bad payment terms");
  }
  const { uid } = await requireSession();
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
  const inv = await sendNextReminder(uid, id, "you");
  if (!inv) throw new Error("Invoice not found");
  refreshAll();
  return inv;
}

// ---------- uploaded invoices ----------

export async function registerUploadedInvoiceAction(input: {
  clientId?: string;
  newClient?: { name: string; email: string };
  amount: number;
  currency?: CurrencyCode;
  description: string;
  dueAt: number;
  externalNumber?: string;
  uploadId: string;
  alreadySent: boolean;
  sentAt?: number;
}) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be > 0");
  }
  if (!Number.isFinite(input.dueAt)) throw new Error("A due date is required");
  if (input.currency && !isCurrencyCode(input.currency)) {
    throw new Error("Bad currency");
  }
  if (!input.clientId && !input.newClient) {
    throw new Error("Pick or add a client");
  }
  if (input.newClient && (!input.newClient.name.trim() || !input.newClient.email.trim())) {
    throw new Error("Client name and email are required");
  }
  if (input.alreadySent && !Number.isFinite(input.sentAt)) {
    throw new Error("When did you send it? A sent date is required");
  }
  if (!input.uploadId) throw new Error("Upload the PDF first");
  const { uid } = await requireSession();
  const inv = await registerUploadedInvoice(uid, input);
  if (!inv) throw new Error("Could not register the invoice");
  refreshAll();
  return inv;
}

// ---------- automations ----------

export async function setAutomationAction(id: AutomationId, enabled: boolean) {
  if (!isAutomationId(id)) throw new Error("Unknown automation");
  const { uid } = await requireSession();
  const next = await setAutomationEnabled(uid, id, enabled);
  if (!next) throw new Error("Unknown automation");
  refreshAll();
  return next;
}

// ---------- API keys ----------

export async function createApiKeyAction(name: string) {
  if (!name.trim()) throw new Error("Key name is required");
  const { uid } = await requireSession();
  const created = await createApiKey(uid, name.trim());
  refreshAll();
  return created;
}

export async function deleteApiKeyAction(id: string) {
  const { uid } = await requireSession();
  const ok = await deleteApiKey(uid, id);
  if (!ok) throw new Error("Key not found");
  refreshAll();
  return { id };
}

export async function listApiKeysAction() {
  const { uid } = await requireSession();
  return listApiKeys(uid);
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
