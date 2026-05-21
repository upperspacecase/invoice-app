import "server-only";
import { Resend } from "resend";
import { formatMoney } from "@/lib/currency";
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf";
import type { Business, Invoice } from "@/lib/types";

export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured" | "failed"; detail: string };

let client: Resend | null = null;
function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

export type SendInput = {
  business: Business;
  invoice: Invoice;
  replyTo?: string;
  paymentLinkUrl?: string;
  publicPdfUrl?: string;
};

export async function sendInvoiceEmail(
  input: SendInput
): Promise<EmailResult> {
  const resend = getClient();
  if (!resend) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "RESEND_API_KEY missing — email skipped.",
    };
  }
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "RESEND_FROM_EMAIL missing — email skipped.",
    };
  }

  const { business, invoice } = input;
  const subject = `Invoice ${invoice.id} from ${business.name}`;
  const total = formatMoney(invoice.amount, invoice.currency, {
    withCode: true,
  });
  const lines = [
    `Hi ${invoice.clientName.split(/[\s,]+/)[0] || "there"},`,
    "",
    `Here's invoice ${invoice.id} for ${total}.`,
    invoice.description ? `For: ${invoice.description}` : "",
    "",
    input.paymentLinkUrl ? `Pay now: ${input.paymentLinkUrl}` : "",
    input.publicPdfUrl ? `PDF: ${input.publicPdfUrl}` : "",
    "",
    `Pay via: ${business.payment}`,
    "",
    `Reply to this email with any questions.`,
    "",
    `— ${business.name}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  const html = textToHtml(lines, business.brandColor);

  let pdf: Buffer;
  try {
    pdf = await renderInvoicePdf({
      business,
      invoice,
      paymentLinkUrl: input.paymentLinkUrl,
    });
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "PDF render failed",
    };
  }

  try {
    const result = await resend.emails.send({
      from: `${business.name} <${from}>`,
      to: invoice.clientEmail,
      replyTo: input.replyTo || business.email,
      subject,
      text: lines,
      html,
      attachments: [
        {
          filename: `${invoice.id}.pdf`,
          content: pdf,
        },
      ],
    });
    if (result.error) {
      return {
        ok: false,
        reason: "failed",
        detail: result.error.message,
      };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "Resend rejected the send",
    };
  }
}

export type ReminderStage = 1 | 2 | 3;

// Smart follow-ups: a small AI assistant that nudges on unpaid invoices.
// The voice is warm and apologetic-of-the-interruption; the ask escalates
// only slightly across the three stages and always offers a way out.
function reminderCopy(input: {
  business: Business;
  invoice: Invoice;
  stage: ReminderStage;
  payLine: string;
}): { subject: string; body: string[] } {
  const { business, invoice, stage, payLine } = input;
  const first = invoice.clientName.split(/[\s,]+/)[0] || "there";
  const total = formatMoney(invoice.amount, invoice.currency, {
    withCode: true,
  });
  const assistant = `${business.name}'s assistant`;

  if (stage <= 1) {
    return {
      subject: `A gentle nudge on invoice ${invoice.id}`,
      body: [
        `Hi ${first},`,
        "",
        `I'm ${assistant} — just floating invoice ${invoice.id} back to the top of your inbox. It went over on ${invoice.date} and is still showing as unpaid on our end.`,
        "",
        `Amount: ${total}`,
        payLine,
        "",
        `No rush at all — whenever it's convenient. And do reply if anything needs adjusting.`,
        "",
        `Have a lovely day,`,
        assistant,
      ],
    };
  }
  if (stage === 2) {
    return {
      subject: `Just checking in on invoice ${invoice.id}`,
      body: [
        `Hi ${first},`,
        "",
        `${assistant} here again. I wanted to make sure invoice ${invoice.id} (${total}), sent ${invoice.date}, didn't slip through — it's still open on our side.`,
        "",
        payLine,
        "",
        `If it's already on its way, thank you! If something's holding it up, just reply and I'll help sort it out.`,
        "",
        `Thanks so much,`,
        assistant,
      ],
    };
  }
  return {
    subject: `One more note on invoice ${invoice.id}`,
    body: [
      `Hi ${first},`,
      "",
      `One last friendly note from ${assistant} about invoice ${invoice.id} (${total}), sent back on ${invoice.date}. It's still marked unpaid, and we'd really appreciate getting it settled when you have a moment.`,
      "",
      payLine,
      "",
      `If there's anything we can do to make payment easier — or if something needs fixing on the invoice — just reply and we'll take care of it.`,
      "",
      `With thanks,`,
      assistant,
    ],
  };
}

export async function sendReminderEmail(input: {
  business: Business;
  invoice: Invoice;
  replyTo?: string;
  paymentLinkUrl?: string;
  stage: ReminderStage;
}): Promise<EmailResult> {
  const resend = getClient();
  if (!resend) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "RESEND_API_KEY missing",
    };
  }
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "RESEND_FROM_EMAIL missing",
    };
  }

  const { business, invoice, stage } = input;
  const payLine = input.paymentLinkUrl
    ? `Pay in a tap: ${input.paymentLinkUrl}`
    : `Pay via: ${business.payment}`;
  const { subject, body } = reminderCopy({
    business,
    invoice,
    stage,
    payLine,
  });
  const lines = body.join("\n");

  try {
    const result = await resend.emails.send({
      from: `${business.name} Assistant <${from}>`,
      to: invoice.clientEmail,
      replyTo: input.replyTo || business.email,
      subject,
      text: lines,
      html: textToHtml(lines, business.brandColor),
    });
    if (result.error) {
      return { ok: false, reason: "failed", detail: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "send failed",
    };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
      ? "&lt;"
      : c === ">"
      ? "&gt;"
      : c === '"'
      ? "&quot;"
      : "&#39;"
  );
}

function textToHtml(text: string, accent?: string): string {
  const body = escapeHtml(text)
    .replace(
      /(https?:\/\/[^\s]+)/g,
      `<a href="$1" style="color:${accent || "#0a0a0a"};text-decoration:underline">$1</a>`
    )
    .replace(/\n/g, "<br/>");
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#0a0a0a;max-width:560px;margin:0 auto;padding:24px">${body}</div>`;
}
