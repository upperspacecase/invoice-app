import "server-only";
import { formatMoney } from "@/lib/currency";
import { followupBody } from "@/lib/followup-templates";
import type { Business, FollowupStage, Invoice } from "@/lib/types";

// Nudge writes the follow-up *as the tradie's invoicing assistant*. Stage 1 is
// polite, 2 firm, 3 a final notice. Uses Claude when ANTHROPIC_API_KEY is set;
// otherwise an honest staged template. The greeting is included; the pay link
// and payment details are appended by the caller — the model never invents
// links, dates, or amounts.
const MODEL = "claude-haiku-4-5-20251001";

export async function draftFollowupBody(input: {
  business: Business;
  invoice: Invoice;
  stage: FollowupStage;
}): Promise<string> {
  const { business, invoice, stage } = input;
  const total = formatMoney(invoice.amount, invoice.currency, {
    withCode: true,
  });
  const first = invoice.clientName.split(/[\s,]+/)[0] || "there";

  const llm = await tryClaude({ business, invoice, stage, total, first });
  return (
    llm ??
    followupBody({
      businessName: business.name,
      clientFirst: first,
      invoiceId: invoice.id,
      total,
      stage,
    })
  );
}

const TONE: Record<FollowupStage, string> = {
  1: "warm and polite, zero pressure — this is the first nudge",
  2: "friendly but firm; the invoice is now overdue",
  3: "a respectful final notice; the invoice is well past due",
};

async function tryClaude(args: {
  business: Business;
  invoice: Invoice;
  stage: FollowupStage;
  total: string;
  first: string;
}): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const { business, invoice, stage, total, first } = args;

  const system =
    `You are Nudge, ${business.name}'s friendly invoicing assistant. You write a short follow-up email to a client about an unpaid invoice, on the tradesperson's behalf. ` +
    `Introduce yourself as ${business.name}'s invoicing assistant. Be ${TONE[stage]}. ` +
    `Keep it to 2-3 sentences after the greeting. Reference only the invoice id and amount you are given — never invent dates, facts, links, or payment details. ` +
    `Do NOT include a payment link or bank details (the system appends those). Do NOT sign off. ` +
    `Start with exactly "Hi ${first}," on its own line, and end by leading into the payment options (e.g. "…here's the easiest way to sort it:"). Output plain text only.`;
  const user = `Invoice ${invoice.id} for ${total} is unpaid${invoice.description ? `. Work: ${invoice.description}` : ""}. Write the follow-up.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = (json.content ?? [])
      .filter((b) => b?.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("\n")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}

