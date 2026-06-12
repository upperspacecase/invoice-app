import "server-only";
import {
  createInvoice,
  getBusiness,
  getFeesYtd,
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
import { convert } from "@/lib/fx";
import { currencyMeta } from "@/lib/currency";
import { ANNUAL_FEE_CAP_MAJOR } from "@/lib/platform-fee";
import type { ActivityActor, CurrencyCode, Invoice } from "@/lib/types";

export type SendInvoiceInput = {
  clientId: string;
  amount: number;
  description: string;
  currency?: CurrencyCode;
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
    // How much of this year's $2,000 cap is left, expressed in the invoice's
    // currency, so the 1% fee on this link never pushes the business over.
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
    const link = await createInvoicePaymentLink({
      business,
      invoice,
      maxFeeMinor,
    });
    if (link.ok) {
      const updated = await updateInvoice(uid, invoice.id, {
        paymentLinkUrl: link.url,
        stripePaymentLinkId: link.stripeLinkId,
        platformFeeMinor: link.appliedFeeMinor,
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
  actor: ActivityActor = "agent"
): Promise<Invoice | null> {
  const inv = await remindInvoice(uid, invoiceId, actor);
  if (!inv) return null;
  const business = await getBusiness(uid);
  const fresh = (await getInvoice(uid, invoiceId)) ?? inv;
  const result = await sendReminderEmail({
    business,
    invoice: fresh,
    replyTo: business.email,
    paymentLinkUrl: fresh.paymentLinkUrl,
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
