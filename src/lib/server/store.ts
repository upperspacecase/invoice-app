import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type {
  ActivityActor,
  ActivityEvent,
  ApiKey,
  AutomationId,
  Business,
  Client,
  CurrencyCode,
  DeliveryChannel,
  IntegrationId,
  Invoice,
  Tier,
} from "../types";
import type { FeatureId } from "../features";
import {
  formatLabel,
  initialActivity,
  initialAutomations,
  initialBusiness,
  initialClients,
  initialIntegrations,
  initialInvoices,
} from "../demo-data";

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

function integrationsCol(uid: string) {
  return userDoc(uid).collection("integrations");
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

  for (const c of initialClients) {
    batch.set(clientsCol(uid).doc(c.id), {
      ...c,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  for (const inv of initialInvoices) {
    batch.set(invoicesCol(uid).doc(inv.id), {
      ...inv,
      sentAt: Timestamp.fromMillis(inv.sentAt),
      paidAt: inv.paidAt ? Timestamp.fromMillis(inv.paidAt) : null,
    });
  }
  for (const it of initialIntegrations) {
    batch.set(integrationsCol(uid).doc(it.id), {
      ...it,
      connectedAt: it.connectedAt ? Timestamp.fromMillis(it.connectedAt) : null,
    });
  }
  for (const au of initialAutomations) {
    batch.set(automationsCol(uid).doc(au.id), { ...au });
  }
  for (const ev of initialActivity) {
    batch.set(activityCol(uid).doc(ev.id), {
      ...ev,
      at: Timestamp.fromMillis(ev.at),
    });
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
    tier: data.tier ?? "send",
    brandColor:
      typeof data.brandColor === "string" ? data.brandColor : undefined,
    logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : undefined,
    // Default false so pre-existing accounts (signed up before this field
    // existed) get prompted on next visit. ensureUserSeeded explicitly sets
    // false for new accounts.
    onboarded: data.onboarded ?? false,
    stripeAccountId:
      typeof data.stripeAccountId === "string" ? data.stripeAccountId : undefined,
    stripeCustomerId:
      typeof data.stripeCustomerId === "string" ? data.stripeCustomerId : undefined,
    stripeSubscriptionId:
      typeof data.stripeSubscriptionId === "string"
        ? data.stripeSubscriptionId
        : undefined,
  };
}

export async function setTier(uid: string, tier: Tier): Promise<Business> {
  const current = await getBusiness(uid);
  if (current.tier === tier) return current;
  await userDoc(uid).collection("meta").doc(PROFILE_DOC).set({ tier }, { merge: true });
  await pushActivity(
    uid,
    "you",
    tier === "send"
      ? "Switched to Send (free)"
      : tier === "pro"
      ? "Upgraded to Pro"
      : "Upgraded to Get Paid",
    "billing.demo"
  );
  return { ...current, tier };
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
    delivery: (data.delivery as DeliveryChannel) ?? "email",
    deliveryHandle:
      typeof data.deliveryHandle === "string"
        ? data.deliveryHandle
        : undefined,
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
  delivery?: DeliveryChannel;
  deliveryHandle?: string;
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
    delivery: input.delivery ?? "email",
    deliveryHandle: input.deliveryHandle,
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
  const cleaned: Record<string, unknown> = { ...patch };
  if (patch.deliveryHandle === undefined) delete cleaned.deliveryHandle;
  await ref.set(cleaned, { merge: true });
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
    channel: (data.channel as DeliveryChannel) ?? "email",
    sentAt: fromTimestamp(data.sentAt),
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

type CreateInvoiceInput = {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
  channelOverride?: DeliveryChannel;
  actor?: ActivityActor;
};

export async function createInvoice(
  uid: string,
  input: CreateInvoiceInput
): Promise<Invoice | null> {
  const client = await getClient(uid, input.clientId);
  if (!client) return null;
  const channel = input.channelOverride ?? client.delivery;
  const currency = input.currency ?? client.currency;
  const id = await nextInvoiceId(uid);
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
  const batch = adminDb().batch();
  batch.set(invoicesCol(uid).doc(id), {
    ...invoice,
    sentAt: Timestamp.fromMillis(now),
    paidAt: null,
  });
  batch.set(
    clientsCol(uid).doc(client.id),
    { lastAmount: input.amount },
    { merge: true }
  );
  await batch.commit();

  const channelLabel =
    channel === "email"
      ? `email to ${client.email}`
      : channel === "portal"
      ? "portal link"
      : channel.charAt(0).toUpperCase() + channel.slice(1);
  await pushActivity(
    uid,
    input.actor ?? "you",
    `Sent ${id} to ${client.name}`,
    `via ${channelLabel}`
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
  await pushActivity(uid, actor, `Marked ${id} paid`, "manual");
  return { ...inv, status: "paid", paidAt: now };
}

export async function remindInvoice(
  uid: string,
  id: string,
  actor: ActivityActor = "agent"
): Promise<Invoice | null> {
  const ref = invoicesCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const inv = normaliseInvoice(snap.id, snap.data() ?? {});
  if (inv.status !== "sent") return inv;
  const now = Date.now();
  await ref.set(
    { lastReminderAt: Timestamp.fromMillis(now) },
    { merge: true }
  );
  await pushActivity(uid, actor, `Sent reminder for ${id}`, `to ${inv.clientName}`);
  return { ...inv, lastReminderAt: now };
}

// ---------- integrations ----------

function normaliseIntegration(id: string, data: Record<string, unknown>) {
  return {
    id: id as IntegrationId,
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    color: String(data.color ?? "#0a0a0a"),
    connected: Boolean(data.connected),
    account:
      typeof data.account === "string" && data.account ? data.account : undefined,
    connectedAt: data.connectedAt ? fromTimestamp(data.connectedAt) : undefined,
  };
}

export async function listIntegrations(uid: string) {
  const snap = await integrationsCol(uid).get();
  return snap.docs.map((d) => normaliseIntegration(d.id, d.data()));
}

export async function setIntegrationConnected(
  uid: string,
  id: IntegrationId,
  connected: boolean,
  account?: string
) {
  const ref = integrationsCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const existing = normaliseIntegration(snap.id, snap.data() ?? {});
  const update: Record<string, unknown> = { connected };
  if (connected) {
    update.account = account ?? `${existing.name.toLowerCase()}-account`;
    update.connectedAt = FieldValue.serverTimestamp();
  } else {
    update.account = FieldValue.delete();
    update.connectedAt = FieldValue.delete();
  }
  await ref.set(update, { merge: true });
  await pushActivity(
    uid,
    "you",
    `${connected ? "Connected" : "Disconnected"} ${existing.name}`,
    connected
      ? "OAuth flow stubbed for demo · scope: invoice.write"
      : "Disconnected"
  );
  const next = await ref.get();
  return normaliseIntegration(next.id, next.data() ?? {});
}

// ---------- automations ----------

function normaliseAutomation(id: string, data: Record<string, unknown>) {
  return {
    id: id as AutomationId,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    enabled: Boolean(data.enabled),
  };
}

export async function listAutomations(uid: string) {
  const snap = await automationsCol(uid).get();
  return snap.docs.map((d) => normaliseAutomation(d.id, d.data()));
}

export async function setAutomationEnabled(
  uid: string,
  id: AutomationId,
  enabled: boolean
) {
  const ref = automationsCol(uid).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.set({ enabled }, { merge: true });
  const after = normaliseAutomation(id, { ...(snap.data() ?? {}), enabled });
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

// ---------- feature votes ----------

function votesCol(uid: string) {
  return userDoc(uid).collection("featureVotes");
}

export async function voteForFeature(
  uid: string,
  id: FeatureId
): Promise<{ alreadyVoted: boolean }> {
  const ref = votesCol(uid).doc(id);
  const snap = await ref.get();
  if (snap.exists) return { alreadyVoted: true };
  await ref.set({ at: FieldValue.serverTimestamp() });
  await pushActivity(
    uid,
    "you",
    `Voted to prioritise "${id}"`,
    "features.vote"
  );
  return { alreadyVoted: false };
}

export async function listFeatureVotes(uid: string): Promise<FeatureId[]> {
  const snap = await votesCol(uid).get();
  return snap.docs.map((d) => d.id as FeatureId);
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
  const [
    business,
    clients,
    invoices,
    integrations,
    automations,
    apiKeys,
    activity,
    featureVotes,
  ] = await Promise.all([
    getBusiness(uid),
    listClients(uid),
    listInvoices(uid),
    listIntegrations(uid),
    listAutomations(uid),
    listApiKeys(uid),
    listActivity(uid),
    listFeatureVotes(uid),
  ]);
  return {
    business,
    clients,
    invoices,
    integrations,
    automations,
    apiKeys,
    activity,
    featureVotes,
  };
}
