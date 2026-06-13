import "server-only";
import { Resend } from "resend";
import { formatMoney } from "@/lib/currency";
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { displayId } from "@/lib/invoice-display";
import { brandedEmailHtml } from "./template";
import { draftFollowupBody } from "./followup-copy";
import type { Business, FollowupStage, Invoice } from "@/lib/types";

export function formatDueDate(at: number): string {
  return new Date(at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  // Uploaded invoices attach the tradie's own PDF instead of a generated one.
  pdfOverride?: Buffer;
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
  const docId = displayId(invoice);
  const subject = `Invoice ${docId} from ${business.name}`;
  const total = formatMoney(invoice.amount, invoice.currency, {
    withCode: true,
  });
  const body = [
    `Hi ${invoice.clientName.split(/[\s,]+/)[0] || "there"},`,
    "",
    `Here's invoice ${docId} for ${total}, due ${formatDueDate(invoice.dueAt)}.`,
    invoice.description ? `For: ${invoice.description}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
  const footerLines = [
    `Pay via: ${business.payment}`,
    "Reply to this email with any questions.",
  ];
  const signoff = `— ${business.name}`;
  const lines = [
    body,
    "",
    input.paymentLinkUrl ? `Pay now: ${input.paymentLinkUrl}` : "",
    input.publicPdfUrl ? `PDF: ${input.publicPdfUrl}` : "",
    "",
    ...footerLines,
    "",
    signoff,
  ]
    .filter((l) => l !== "")
    .join("\n");

  const html = brandedEmailHtml({
    businessName: business.name,
    body,
    payUrl: input.paymentLinkUrl,
    payLabel: "View & Pay Invoice",
    footerLines,
    signoff,
  });

  let pdf: Buffer;
  if (input.pdfOverride) {
    pdf = input.pdfOverride;
  } else {
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
          filename: `${docId}.pdf`.replace(/[^\w.#-]/g, "_"),
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
  stage: FollowupStage;
  attachment?: { filename: string; content: Buffer };
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
  const docId = displayId(invoice);
  const subject =
    stage === 0
      ? `Heads-up: invoice ${docId} from ${business.name} is due ${formatDueDate(invoice.dueAt)}`
      : stage === 1
      ? `Friendly reminder: invoice ${docId} from ${business.name}`
      : stage === 2
      ? `Following up: invoice ${docId} from ${business.name}`
      : `Final notice: invoice ${docId} from ${business.name}`;
  // Nudge writes the message as the assistant (LLM when configured, staged
  // template otherwise); we own the pay link + payment lines + sign-off.
  const body = await draftFollowupBody({ business, invoice, stage });
  const footerLines = [
    `Or pay direct: ${business.payment}`,
    "If it's already on its way, or something needs adjusting, just reply and I'll pass it straight on.",
  ];
  const signoff = `Nudge — on behalf of ${business.name}`;
  const lines = [
    body,
    "",
    input.paymentLinkUrl ? `Pay now: ${input.paymentLinkUrl}` : "",
    "",
    ...footerLines,
    "",
    "Thanks so much,",
    signoff,
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
      html: brandedEmailHtml({
        businessName: business.name,
        body,
        payUrl: input.paymentLinkUrl,
        payLabel: "View & Pay Invoice",
        footerLines,
        signoff,
        onBehalf: true,
      }),
      ...(input.attachment ? { attachments: [input.attachment] } : {}),
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

