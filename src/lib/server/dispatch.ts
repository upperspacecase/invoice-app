import "server-only";
import {
  createInvoice,
  getBusiness,
  getInvoice,
  logActivity,
  remindInvoice,
  updateInvoice,
} from "./store";
import {
  sendInvoiceEmail,
  sendReminderEmail,
} from "@/lib/email/send-invoice";
import { createInvoicePaymentLink } from "@/lib/stripe/payment-link";
import type {
  ActivityActor,
  CurrencyCode,
  DeliveryChannel,
  Invoice,
} from "@/lib/types";

export type SendInvoiceInput = {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
  channelOverride?: DeliveryChannel;
  actor?: ActivityActor;
};

export async function sendInvoice(
  uid: string,
  input: SendInvoiceInput
): Promise<Invoice | null> {
  let invoice = await createInvoice(uid, input);
  if (!invoice) return null;

  const business = await getBusiness(uid);

  // Try to attach a Stripe Payment Link if the user has connected Stripe.
  // Failures are non-fatal — the invoice still goes out, the user can fix
  // the connection from /app/settings/billing.
  if (business.stripeAccountId) {
    const link = await createInvoicePaymentLink({ business, invoice });
    if (link.ok) {
      const updated = await updateInvoice(uid, invoice.id, {
        paymentLinkUrl: link.url,
        stripePaymentLinkId: link.stripeLinkId,
      });
      if (updated) invoice = updated;
      await logActivity(
        uid,
        "system",
        `Attached Stripe Payment Link to ${invoice.id}`,
        link.stripeLinkId
      );
    } else if (link.reason !== "not-configured" && link.reason !== "not-connected") {
      await logActivity(
        uid,
        "system",
        `Payment link failed for ${invoice.id}`,
        link.detail
      );
    }
  }

  if (invoice.channel === "email") {
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
  } else {
    // Non-email channels stub-deliver — the integration adapters would push
    // to QB/Xero/Slack here; for now we just note it on the activity feed.
    await logActivity(
      uid,
      "system",
      `Would deliver ${invoice.id} via ${invoice.channel}`,
      "integration adapter is stubbed",
    );
  }

  return invoice;
}

export async function sendInvoiceReminder(
  uid: string,
  invoiceId: string,
  actor: ActivityActor = "agent"
): Promise<Invoice | null> {
  const current = await getInvoice(uid, invoiceId);
  if (!current) return null;
  if (current.status !== "sent") return current;

  const updated = await remindInvoice(uid, invoiceId, actor);
  if (!updated) return current;
  if (updated.channel !== "email") return updated;

  // The follow-up cadence runs three nudges (day 3 / 10 / 21); copy escalates
  // gently with each stage but never past the third.
  const stage = Math.min(updated.reminderCount ?? 1, 3) as 1 | 2 | 3;
  const business = await getBusiness(uid);
  const result = await sendReminderEmail({
    business,
    invoice: updated,
    replyTo: business.email,
    paymentLinkUrl: updated.paymentLinkUrl,
    stage,
  });
  if (result.ok) {
    await logActivity(
      uid,
      "system",
      `Emailed follow-up for ${invoiceId}`,
      `resend.id=${result.id}`
    );
  } else if (result.reason === "not-configured") {
    await logActivity(
      uid,
      "system",
      `Follow-up email skipped for ${invoiceId}`,
      result.detail
    );
  } else {
    await logActivity(
      uid,
      "system",
      `Follow-up email failed for ${invoiceId}`,
      result.detail
    );
  }
  return updated;
}
