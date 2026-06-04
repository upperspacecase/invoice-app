import "server-only";
import { Resend } from "resend";
import { formatMoney } from "@/lib/currency";
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { draftFollowupBody } from "./followup-copy";
import type { Business, FollowupStage, Invoice } from "@/lib/types";

function clampStage(n: number): FollowupStage {
  if (n >= 3) return 3;
  if (n <= 1) return 1;
  return 2;
}

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

export async function sendReminderEmail(input: {
  business: Business;
  invoice: Invoice;
  replyTo?: string;
  paymentLinkUrl?: string;
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

  const { business, invoice } = input;
  const stage = clampStage(invoice.reminderCount ?? 1);
  const subject =
    stage === 1
      ? `Friendly reminder: invoice ${invoice.id} from ${business.name}`
      : stage === 2
      ? `Following up: invoice ${invoice.id} from ${business.name}`
      : `Final notice: invoice ${invoice.id} from ${business.name}`;
  // Nudge writes the message as the assistant (LLM when configured, staged
  // template otherwise); we own the pay link + payment lines + sign-off.
  const body = await draftFollowupBody({ business, invoice, stage });
  const lines = [
    body,
    "",
    input.paymentLinkUrl ? `Pay now: ${input.paymentLinkUrl}` : "",
    "",
    `Or pay direct: ${business.payment}`,
    "",
    `If it's already on its way, or something needs adjusting, just reply and I'll pass it straight on.`,
    "",
    `Thanks so much,`,
    `Nudge — on behalf of ${business.name}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  try {
    const result = await resend.emails.send({
      from: `${business.name} via Nudge <${from}>`,
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
      `<a href="$1" style="color:${accent || "#1f8f50"};text-decoration:underline">$1</a>`
    )
    .replace(/\n/g, "<br/>");
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#1c1f1a;max-width:560px;margin:0 auto;padding:24px">${body}</div>`;
}
