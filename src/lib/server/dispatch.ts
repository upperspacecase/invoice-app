import "server-only";
import {
  createClient,
  createInvoice,
  getBusiness,
  getFeesYtd,
  getInvoice,
  logActivity,
  remindInvoice,
  updateInvoice,
} from "./store";
import { adminBucket } from "@/lib/firebase/admin";
import { displayId } from "@/lib/invoice-display";
import {
  sendInvoiceEmail,
  sendReminderEmail,
} from "@/lib/email/send-invoice";
import { createInvoicePaymentLink } from "@/lib/stripe/payment-link";
import { convert } from "@/lib/fx";
import { currencyMeta } from "@/lib/currency";
import { ANNUAL_FEE_CAP_MAJOR } from "@/lib/platform-fee";
import {
  DEFAULT_TERMS_DAYS,
  FINAL_STAGE,
  effectiveLastStage,
} from "@/lib/followup-cadence";
import type {
  ActivityActor,
  Business,
  CurrencyCode,
  FollowupStage,
  Invoice,
} from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

export type SendInvoiceInput = {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
  termsDays?: number;
  dueAt?: number;
  actor?: ActivityActor;
};

// Attach a Stripe Payment Link (1% fee, clamped to the remaining annual cap).
// Non-fatal: the invoice still goes out if Stripe isn't connected or errors.
// Returns the invoice, updated with link fields when one was created.
export async function attachPaymentLink(
  uid: string,
  business: Business,
  invoice: Invoice
): Promise<Invoice> {
  if (!business.stripeAccountId) return invoice;
  const year = new Date().getFullYear();
  const ytdMajor = await getFeesYtd(uid, year);
  const roomBusinessMajor = Math.max(0, ANNUAL_FEE_CAP_MAJOR - ytdMajor);
  const roomInvoiceMajor = await convert(
    roomBusinessMajor,
    business.currency,
    invoice.currency
  );
  const maxFeeMinor = Math.round(
    roomInvoiceMajor * Math.pow(10, currencyMeta(invoice.currency).decimals)
  );
  const link = await createInvoicePaymentLink({ business, invoice, maxFeeMinor });
  if (link.ok) {
    const updated = await updateInvoice(uid, invoice.id, {
      paymentLinkUrl: link.url,
      stripePaymentLinkId: link.stripeLinkId,
      platformFeeMinor: link.appliedFeeMinor,
    });
    await logActivity(
      uid,
      "system",
      `Attached Stripe Payment Link to ${invoice.id}`,
      link.stripeLinkId
    );
    return updated ?? invoice;
  }
  if (link.reason !== "not-configured" && link.reason !== "not-connected") {
    await logActivity(uid, "system", `Payment link failed for ${invoice.id}`, link.detail);
  }
  return invoice;
}

export async function sendInvoice(
  uid: string,
  input: SendInvoiceInput
): Promise<Invoice | null> {
  const dueAt =
    input.dueAt ?? Date.now() + (input.termsDays ?? DEFAULT_TERMS_DAYS) * DAY;
  let invoice = await createInvoice(uid, { ...input, dueAt });
  if (!invoice) return null;

  const business = await getBusiness(uid);
  invoice = await attachPaymentLink(uid, business, invoice);

  const result = await sendInvoiceEmail({
    business,
    invoice,
    replyTo: business.email,
    paymentLinkUrl: invoice.paymentLinkUrl,
  });
  if (result.ok) {
    await logActivity(
      uid,
      "system",
      `Emailed ${invoice.id} to ${invoice.clientEmail}`,
      `resend.id=${result.id}`
    );
  } else if (result.reason === "not-configured") {
    await logActivity(
      uid,
      "system",
      `Email skipped for ${invoice.id}`,
      result.detail
    );
  } else {
    await logActivity(
      uid,
      "system",
      `Email failed for ${invoice.id}`,
      result.detail
    );
  }

  return invoice;
}

export async function sendInvoiceReminder(
  uid: string,
  invoiceId: string,
  actor: ActivityActor = "agent",
  stage: FollowupStage = 1
): Promise<Invoice | null> {
  const inv = await remindInvoice(uid, invoiceId, actor, stage);
  if (!inv) return null;
  const business = await getBusiness(uid);
  const fresh = (await getInvoice(uid, invoiceId)) ?? inv;
  // Uploaded invoices carry the tradie's own PDF — attach it so the client
  // always has the document, not just a link.
  let attachment: { filename: string; content: Buffer } | undefined;
  if (fresh.source === "uploaded" && fresh.pdfPath) {
    attachment = await loadStoredPdfAttachment(fresh).catch(() => undefined);
  }
  const result = await sendReminderEmail({
    business,
    invoice: fresh,
    replyTo: business.email,
    paymentLinkUrl: fresh.paymentLinkUrl,
    stage,
    attachment,
  });
  if (result.ok) {
    await logActivity(
      uid,
      "system",
      `Emailed reminder for ${invoiceId}`,
      `resend.id=${result.id}`
    );
  } else if (result.reason === "not-configured") {
    await logActivity(
      uid,
      "system",
      `Reminder email skipped for ${invoiceId}`,
      result.detail
    );
  } else {
    await logActivity(
      uid,
      "system",
      `Reminder email failed for ${invoiceId}`,
      result.detail
    );
  }
  return fresh;
}

// Send the next-due reminder stage for a manual "remind now" tap: one past the
// deepest stage already sent, clamped to [1, FINAL_STAGE]. Skips the heads-up.
export async function sendNextReminder(
  uid: string,
  invoiceId: string,
  actor: ActivityActor = "you"
): Promise<Invoice | null> {
  const inv = await getInvoice(uid, invoiceId);
  if (!inv) return null;
  const stage = Math.min(
    Math.max(effectiveLastStage(inv) + 1, 1),
    FINAL_STAGE
  ) as FollowupStage;
  return sendInvoiceReminder(uid, invoiceId, actor, stage);
}

// Download an uploaded invoice's stored PDF for re-attachment to reminders.
async function loadStoredPdfAttachment(
  inv: Invoice
): Promise<{ filename: string; content: Buffer } | undefined> {
  if (!inv.pdfPath) return undefined;
  const [buf] = await adminBucket().file(inv.pdfPath).download();
  return {
    filename: `${displayId(inv)}.pdf`.replace(/[^\w.#-]/g, "_"),
    content: buf,
  };
}

export type RegisterUploadedInvoiceInput = {
  clientId?: string;
  newClient?: { name: string; email: string };
  amount: number;
  currency?: CurrencyCode;
  description: string;
  dueAt: number;
  externalNumber?: string;
  uploadId: string; // temp storage path from /api/upload/parse
  alreadySent: boolean;
  sentAt?: number;
  actor?: ActivityActor;
};

// Register a tradie's own uploaded invoice into the chase engine. When it was
// already sent to the client, Nudge silently takes the watch; otherwise it
// emails the original PDF (with a pay link) first. Either way the due-date
// cadence then applies.
export async function registerUploadedInvoice(
  uid: string,
  input: RegisterUploadedInvoiceInput
): Promise<Invoice | null> {
  // Never move a file outside this user's own upload area.
  if (!input.uploadId.startsWith(`users/${uid}/uploads/`)) return null;

  let clientId = input.clientId;
  if (!clientId && input.newClient) {
    const created = await createClient(uid, {
      name: input.newClient.name,
      email: input.newClient.email,
      currency: input.currency,
    });
    clientId = created.id;
  }
  if (!clientId) return null;

  let invoice = await createInvoice(uid, {
    clientId,
    amount: input.amount,
    description: input.description,
    currency: input.currency,
    dueAt: input.dueAt,
    sentAt: input.alreadySent ? input.sentAt : undefined,
    source: "uploaded",
    externalNumber: input.externalNumber,
    actor: input.actor ?? "you",
  });
  if (!invoice) return null;

  // Move the temp upload to its permanent home and record the path.
  const pdfPath = `users/${uid}/invoices/${invoice.id}.pdf`;
  try {
    await adminBucket().file(input.uploadId).move(pdfPath);
    const updated = await updateInvoice(uid, invoice.id, { pdfPath });
    if (updated) invoice = updated;
  } catch (e) {
    await logActivity(
      uid,
      "system",
      `Could not store PDF for ${invoice.id}`,
      e instanceof Error ? e.message : "storage error"
    );
  }

  const business = await getBusiness(uid);
  invoice = await attachPaymentLink(uid, business, invoice);

  if (input.alreadySent) {
    await logActivity(
      uid,
      "agent",
      `Nudge took the watch on ${displayId(invoice)}`,
      "uploaded invoice"
    );
    return invoice;
  }

  // Not yet sent — email the tradie's own PDF to the client.
  const attachment = invoice.pdfPath
    ? await loadStoredPdfAttachment(invoice).catch(() => undefined)
    : undefined;
  const result = await sendInvoiceEmail({
    business,
    invoice,
    replyTo: business.email,
    paymentLinkUrl: invoice.paymentLinkUrl,
    pdfOverride: attachment?.content,
  });
  await logActivity(
    uid,
    "system",
    result.ok
      ? `Emailed ${displayId(invoice)} to ${invoice.clientEmail}`
      : `Email ${result.reason === "not-configured" ? "skipped" : "failed"} for ${invoice.id}`,
    result.ok ? `resend.id=${result.id}` : result.detail
  );
  return invoice;
}
