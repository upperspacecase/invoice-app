import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type {
  ActivityActor,
  ActivityEvent,
  ApiKey,
  Automation,
  AutomationId,
  Business,
  Client,
  CurrencyCode,
  FollowupStage,
  Invoice,
} from "../types";
import { displayId } from "../invoice-display";
import {
  formatLabel,
  initialAutomations,
  initialBusiness,
} from "../demo-data";
import { convert } from "../fx";
import { currencyMeta } from "../currency";

const PROFILE_DOC = "profile";

function userDoc(uid: string) {
  return adminDb().collection("users").doc(uid);
}

function clientsCol(uid: string) {
  return userDoc(uid).collection("clients");
}

function invoicesCol(uid: string) {
  return userDoc(uid).collection("invoices");
}

function automationsCol(uid: string) {
  return userDoc(uid).collection("automations");
}

function activityCol(uid: string) {
  return userDoc(uid).collection("activity");
}

const apiKeysCol = () => adminDb().collection("apiKeys");

function fromTimestamp(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

// ---------- bootstrap ----------

export async function ensureUserSeeded(
  uid: string,
  hint: { email?: string | null; displayName?: string | null }
) {
  const profileRef = userDoc(uid).collection("meta").doc(PROFILE_DOC);
  const snap = await profileRef.get();
  if (snap.exists) return;
  const business: Business = {
    ...initialBusiness,
    name: hint.displayName?.trim() || initialBusiness.name,
    email: hint.email || initialBusiness.email,
    onboarded: false,
  };
  const batch = adminDb().batch();
  batch.set(profileRef, { ...business, createdAt: FieldValue.serverTimestamp() });

  // New accounts start empty — no demo clients/invoices — and land on the
  // mascot empty state. Only the agent's one real automation is seeded.
  for (const au of initialAutomations) {
    batch.set(automationsCol(uid).doc(au.id), { ...au });
  }
  await batch.commit();
}

// ---------- helpers ----------

async function pushActivity(
  uid: string,
  who: ActivityActor,
  text: string,
  meta = ""
) {
  const ref = activityCol(uid).doc();
  await ref.set({
    id: ref.id,
    who,
    text,
    meta,
    at: FieldValue.serverTimestamp(),
  });
}

export async function logActivity(
  uid: string,
  who: ActivityActor,
  text: string,
  meta = ""
) {
  await pushActivity(uid, who, text, meta);
}

// ---------- business / profile ----------

export async function getBusiness(uid: string): Promise<Business> {
  const ref = userDoc(uid).collection("meta").doc(PROFILE_DOC);
  const snap = await ref.get();
  const data = snap.exists ? (snap.data() as Partial<Business>) : initialBusiness;
  return {
    name: data.name ?? initialBusiness.name,
    email: data.email ?? initialBusiness.email,
    payment: data.payment ?? initialBusiness.payment,
    company: data.company ?? initialBusiness.company,
    currency: data.currency ?? initialBusiness.currency,
    brandColor:
      typeof data.brandColor === "string" ? data.brandColor : undefined,
    logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : undefined,
    // Default false so pre-existing accounts (signed up before this field
    // existed) get prompted on next visit. ensureUserSeeded explicitly sets
    // false for new accounts.
    onboarded: data.onboarded ?? false,
    stripeAccountId:
      typeof data.stripeAccountId === "string" ? data.stripeAccountId : undefined,
  };
}

export async function updateBusiness(
  uid: string,
  patch: Partial<Business>
): Promise<Business> {
  const ref = userDoc(uid).collection("meta").doc(PROFILE_DOC);
  await ref.set(patch, { merge: true });
  return getBusiness(uid);
}

export async function setDefaultCurrency(
  uid: string,
  code: CurrencyCode
): Promise<Business> {
  const current = await getBusiness(uid);
  if (current.currency === code) return current;
  const next = await updateBusiness(uid, { currency: code });
  await pushActivity(uid, "you", `Set default currency to ${code}`, "settings.account");
  return next;
}

// ---------- clients ----------

export async function listClients(uid: string): Promise<Client[]> {
  const snap = await clientsCol(uid).orderBy("name").get();
  return snap.docs.map((d) => normaliseClient(d.id, d.data()));
}

export async function getClient(uid: string, id: string): Promise<Client | null> {
  const snap = await clientsCol(uid).doc(id).get();
  if (!snap.exists) return null;
  return normaliseClient(snap.id, snap.data() ?? {});
}

function normaliseClient(id: string, data: Record<string, unknown>): Client {
  return {
    id,
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    lastAmount: typeof data.lastAmount === "number" ? data.lastAmount : 0,
    currency: (data.currency as CurrencyCode) ?? "USD",
  };
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

async function uniqueClientId(uid: string, base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while ((await clientsCol(uid).doc(candidate).get()).exists) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

type CreateClientInput = {
  name: string;
  email: string;
  currency?: CurrencyCode;
};

export async function createClient(
  uid: string,
  input: CreateClientInput
): Promise<Client> {
  const business = await getBusiness(uid);
  const id = await uniqueClientId(uid, slug(input.name));
  const client: Client = {
    id,
    name: input.name,
    email: input.email,
    lastAmount: 0,
    currency: input.currency ?? business.currency,
  };
  await clientsCol(uid).doc(id).set({
    ...client,
    createdAt: FieldValue.serverTimestamp(),
  });
  await pushActivity(uid, "you", `Added client ${client.name}`, "client.create");
  return client;
}

export async function updateClient(
  uid: string,
  id: string,
  patch: Partial<Omit<Client, "id">>
): Promise<Client | null> {
  const ref = clientsCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.set({ ...patch }, { merge: true });
  return getClient(uid, id);
}

// ---------- invoices ----------

function normaliseInvoice(id: string, data: Record<string, unknown>): Invoice {
  return {
    id,
    clientId: String(data.clientId ?? ""),
    clientName: String(data.clientName ?? ""),
    clientEmail: String(data.clientEmail ?? ""),
    amount: typeof data.amount === "number" ? data.amount : 0,
    currency: (data.currency as CurrencyCode) ?? "USD",
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    status: data.status === "paid" ? "paid" : "sent",
    sentAt: fromTimestamp(data.sentAt),
    // Backfill legacy invoices to sentAt + 14d (the old hardcoded "Due in 14
    // days"). New thresholds fire later than the old ones, so no double-send.
    dueAt: data.dueAt
      ? fromTimestamp(data.dueAt)
      : fromTimestamp(data.sentAt) + 14 * 24 * 60 * 60 * 1000,
    lastStage:
      typeof data.lastStage === "number" ? data.lastStage : undefined,
    source: data.source === "uploaded" ? "uploaded" : undefined,
    pdfPath: typeof data.pdfPath === "string" ? data.pdfPath : undefined,
    externalNumber:
      typeof data.externalNumber === "string" ? data.externalNumber : undefined,
    paidAt: data.paidAt ? fromTimestamp(data.paidAt) : undefined,
    lastReminderAt: data.lastReminderAt
      ? fromTimestamp(data.lastReminderAt)
      : undefined,
    paymentLinkUrl:
      typeof data.paymentLinkUrl === "string" ? data.paymentLinkUrl : undefined,
    stripePaymentLinkId:
      typeof data.stripePaymentLinkId === "string"
        ? data.stripePaymentLinkId
        : undefined,
    reminderCount:
      typeof data.reminderCount === "number" ? data.reminderCount : undefined,
    platformFeeMinor:
      typeof data.platformFeeMinor === "number"
        ? data.platformFeeMinor
        : undefined,
    platformFeeRecorded: data.platformFeeRecorded === true ? true : undefined,
  };
}

export async function updateInvoice(
  uid: string,
  id: string,
  patch: Partial<Omit<Invoice, "id">>
): Promise<Invoice | null> {
  const ref = invoicesCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const clean: Record<string, unknown> = { ...patch };
  if (patch.paymentLinkUrl === undefined) delete clean.paymentLinkUrl;
  if (patch.stripePaymentLinkId === undefined) delete clean.stripePaymentLinkId;
  await ref.set(clean, { merge: true });
  const after = await ref.get();
  return normaliseInvoice(after.id, after.data() ?? {});
}

export async function listInvoices(uid: string): Promise<Invoice[]> {
  const snap = await invoicesCol(uid).orderBy("sentAt", "desc").get();
  return snap.docs.map((d) => normaliseInvoice(d.id, d.data()));
}

export async function getInvoice(
  uid: string,
  id: string
): Promise<Invoice | null> {
  const snap = await invoicesCol(uid).doc(id).get();
  if (!snap.exists) return null;
  return normaliseInvoice(snap.id, snap.data() ?? {});
}

async function nextInvoiceId(uid: string): Promise<string> {
  const snap = await invoicesCol(uid).get();
  const numbers = snap.docs
    .map((d) => parseInt(d.id.replace(/\D/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 14;
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

type CreateInvoiceInput = {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
  dueAt?: number;
  sentAt?: number; // override for uploaded invoices already sent earlier
  source?: "created" | "uploaded";
  externalNumber?: string;
  actor?: ActivityActor;
};

export async function createInvoice(
  uid: string,
  input: CreateInvoiceInput
): Promise<Invoice | null> {
  const client = await getClient(uid, input.clientId);
  if (!client) return null;
  const currency = input.currency ?? client.currency;
  const id = await nextInvoiceId(uid);
  const now = Date.now();
  const sentAt = input.sentAt != null ? Math.min(input.sentAt, now) : now;
  const dueAt = input.dueAt ?? sentAt + 14 * DAY_MS;
  const invoice: Invoice = {
    id,
    clientId: client.id,
    clientName: client.name,
    clientEmail: client.email,
    amount: input.amount,
    currency,
    description: input.description,
    date: formatLabel(sentAt),
    status: "sent",
    sentAt,
    dueAt,
    ...(input.source ? { source: input.source } : {}),
    ...(input.externalNumber ? { externalNumber: input.externalNumber } : {}),
  };
  const batch = adminDb().batch();
  batch.set(invoicesCol(uid).doc(id), {
    ...invoice,
    sentAt: Timestamp.fromMillis(sentAt),
    dueAt: Timestamp.fromMillis(dueAt),
    paidAt: null,
  });
  batch.set(
    clientsCol(uid).doc(client.id),
    { lastAmount: input.amount },
    { merge: true }
  );
  await batch.commit();

  await pushActivity(
    uid,
    input.actor ?? "you",
    `Sent ${id} to ${client.name}`,
    `via email to ${client.email}`
  );
  return invoice;
}

export async function markInvoicePaid(
  uid: string,
  id: string,
  actor: ActivityActor = "you"
): Promise<Invoice | null> {
  const ref = invoicesCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const inv = normaliseInvoice(snap.id, snap.data() ?? {});
  if (inv.status === "paid") return inv;
  const now = Date.now();
  await ref.set(
    { status: "paid", paidAt: Timestamp.fromMillis(now) },
    { merge: true }
  );
  await recordPlatformFeeForPaidInvoice(uid, inv);
  await pushActivity(
    uid,
    actor,
    actor === "system" ? `${id} paid — payment landed via Stripe` : `Marked ${id} paid`,
    actor === "system" ? "stripe payment" : "manual"
  );
  return { ...inv, status: "paid", paidAt: now };
}

const REMIND_META: Record<FollowupStage, string> = {
  0: "heads-up before due",
  1: "polite follow-up",
  2: "firm follow-up",
  3: "final notice",
};

export async function remindInvoice(
  uid: string,
  id: string,
  actor: ActivityActor = "agent",
  stage: FollowupStage = 1
): Promise<Invoice | null> {
  const ref = invoicesCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const inv = normaliseInvoice(snap.id, snap.data() ?? {});
  if (inv.status !== "sent") return inv;
  const now = Date.now();
  const reminderCount = (inv.reminderCount ?? 0) + 1;
  await ref.set(
    { lastReminderAt: Timestamp.fromMillis(now), reminderCount, lastStage: stage },
    { merge: true }
  );
  await pushActivity(
    uid,
    actor,
    `Nudged ${displayId(inv)} — ${inv.clientName}`,
    REMIND_META[stage]
  );
  return { ...inv, lastReminderAt: now, reminderCount, lastStage: stage };
}

// ---------- platform fee cap (per business, per calendar year) ----------

function feesDoc(uid: string, year: number) {
  return userDoc(uid).collection("meta").doc(`fees-${year}`);
}

// YTD platform fees charged to this business this year, in the business's
// default currency (major units).
export async function getFeesYtd(uid: string, year: number): Promise<number> {
  const snap = await feesDoc(uid, year).get();
  const total = snap.exists ? snap.data()?.total : 0;
  return typeof total === "number" && Number.isFinite(total) ? total : 0;
}

export async function addFeesYtd(
  uid: string,
  year: number,
  amountMajor: number
): Promise<void> {
  if (!(amountMajor > 0)) return;
  await feesDoc(uid, year).set(
    { total: FieldValue.increment(amountMajor) },
    { merge: true }
  );
}

// When an invoice is paid, count its 1% fee toward the business's yearly cap.
// Guarded by platformFeeRecorded so it only happens once per invoice.
async function recordPlatformFeeForPaidInvoice(
  uid: string,
  inv: Invoice
): Promise<void> {
  if (!inv.platformFeeMinor || inv.platformFeeRecorded) return;
  const business = await getBusiness(uid);
  const meta = currencyMeta(inv.currency);
  const feeMajorInvoiceCcy = inv.platformFeeMinor / Math.pow(10, meta.decimals);
  const feeMajorBusinessCcy = await convert(
    feeMajorInvoiceCcy,
    inv.currency,
    business.currency
  );
  await addFeesYtd(uid, new Date().getFullYear(), feeMajorBusinessCcy);
  await invoicesCol(uid)
    .doc(inv.id)
    .set({ platformFeeRecorded: true }, { merge: true });
}

// ---------- automations ----------

// The only automation ids the product knows about. Stale ids written by older
// code versions are ignored so they can never reach the UI (which would crash
// on an unknown id).
const KNOWN_AUTOMATION_IDS = new Set<AutomationId>(
  initialAutomations.map((a) => a.id)
);

function isAutomationId(id: string): id is AutomationId {
  return KNOWN_AUTOMATION_IDS.has(id as AutomationId);
}

function normaliseAutomation(id: AutomationId, data: Record<string, unknown>): Automation {
  const fallback = initialAutomations.find((a) => a.id === id);
  return {
    id,
    title: String(data.title ?? fallback?.title ?? ""),
    body: String(data.body ?? fallback?.body ?? ""),
    enabled: Boolean(data.enabled),
  };
}

export async function listAutomations(uid: string): Promise<Automation[]> {
  const snap = await automationsCol(uid).get();
  const stored = new Map<AutomationId, Record<string, unknown>>();
  for (const d of snap.docs) {
    if (isAutomationId(d.id)) stored.set(d.id, d.data());
  }
  // Merge with defaults so long-lived accounts missing a known automation row
  // still render (and can toggle) every automation the product ships.
  return initialAutomations.map((def) =>
    normaliseAutomation(def.id, stored.get(def.id) ?? { ...def })
  );
}

export async function setAutomationEnabled(
  uid: string,
  id: AutomationId,
  enabled: boolean
) {
  if (!isAutomationId(id)) return null;
  const ref = automationsCol(uid).doc(id);
  const snap = await ref.get();
  // Backfill the row from defaults if a long-lived account never had it.
  const base = snap.exists
    ? (snap.data() ?? {})
    : { ...(initialAutomations.find((a) => a.id === id) ?? {}) };
  await ref.set({ ...base, enabled }, { merge: true });
  const after = normaliseAutomation(id, { ...base, enabled });
  await pushActivity(
    uid,
    "you",
    `${enabled ? "Enabled" : "Disabled"} ${after.title.toLowerCase()}`,
    "settings.automations"
  );
  return after;
}

// ---------- API keys ----------

export type CreatedApiKey = {
  meta: ApiKey;
  token: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normaliseKey(id: string, data: Record<string, unknown>): ApiKey {
  return {
    id,
    name: String(data.name ?? ""),
    prefix: String(data.prefix ?? ""),
    tokenHash: String(data.tokenHash ?? ""),
    createdAt: fromTimestamp(data.createdAt),
    lastUsedAt: data.lastUsedAt ? fromTimestamp(data.lastUsedAt) : undefined,
  };
}

export async function listApiKeys(uid: string): Promise<ApiKey[]> {
  const snap = await apiKeysCol().where("uid", "==", uid).get();
  return snap.docs.map((d) => normaliseKey(d.id, d.data()));
}

export async function createApiKey(
  uid: string,
  name: string
): Promise<CreatedApiKey> {
  const raw = randomBytes(24).toString("base64url");
  const token = `sk_live_${raw}`;
  const prefix = `sk_live_•••• ${raw.slice(-4)}`;
  const ref = apiKeysCol().doc();
  const data = {
    uid,
    name,
    prefix,
    tokenHash: hashToken(token),
    createdAt: FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  await pushActivity(uid, "you", `Created API key "${name}"`, prefix);
  const meta: ApiKey = {
    id: ref.id,
    name,
    prefix,
    tokenHash: data.tokenHash,
    createdAt: Date.now(),
  };
  return { meta, token };
}

export async function deleteApiKey(uid: string, id: string): Promise<boolean> {
  const ref = apiKeysCol().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const data = snap.data() ?? {};
  if (data.uid !== uid) return false;
  await ref.delete();
  await pushActivity(
    uid,
    "you",
    `Revoked API key "${data.name}"`,
    String(data.prefix ?? "")
  );
  return true;
}

export async function findApiKeyByToken(
  token: string
): Promise<{ uid: string; key: ApiKey } | null> {
  const hash = hashToken(token);
  const snap = await apiKeysCol().where("tokenHash", "==", hash).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const data = doc.data();
  return {
    uid: String(data.uid ?? ""),
    key: normaliseKey(doc.id, data),
  };
}

export async function touchApiKey(id: string): Promise<void> {
  await apiKeysCol().doc(id).set(
    { lastUsedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// ---------- activity ----------

export async function listActivity(
  uid: string,
  limit = 50
): Promise<ActivityEvent[]> {
  const snap = await activityCol(uid).orderBy("at", "desc").limit(limit).get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      who: (data.who as ActivityActor) ?? "system",
      text: String(data.text ?? ""),
      meta: String(data.meta ?? ""),
      at: fromTimestamp(data.at),
    };
  });
}

// ---------- aggregate ----------

export async function listAllUserIds(): Promise<string[]> {
  const refs = await adminDb().collection("users").listDocuments();
  return refs.map((r) => r.id);
}

export async function getAutomation(
  uid: string,
  id: AutomationId
): Promise<{ enabled: boolean } | null> {
  const snap = await automationsCol(uid).doc(id).get();
  if (!snap.exists) return null;
  return { enabled: Boolean(snap.data()?.enabled) };
}

export async function getWorkspace(uid: string) {
  const [business, clients, invoices, automations, apiKeys, activity] =
    await Promise.all([
      getBusiness(uid),
      listClients(uid),
      listInvoices(uid),
      listAutomations(uid),
      listApiKeys(uid),
      listActivity(uid),
    ]);
  return {
    business,
    clients,
    invoices,
    automations,
    apiKeys,
    activity,
  };
}
