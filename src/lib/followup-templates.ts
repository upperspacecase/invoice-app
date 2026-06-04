import type { FollowupStage } from "./types";

// The exact staged follow-up message Nudge sends as the invoicing assistant
// (the no-LLM-key fallback) — and the copy the landing demo renders, so the
// demo is the real thing. Greeting included; the caller appends the pay link,
// payment details and sign-off.
export function followupBody(args: {
  businessName: string;
  clientFirst: string;
  invoiceId: string;
  total: string;
  stage: FollowupStage;
}): string {
  const { businessName, clientFirst, invoiceId, total, stage } = args;
  const intro =
    stage === 1
      ? `I'm Nudge, ${businessName}'s invoicing assistant — I keep things tidy on their behalf. Just a gentle heads-up that invoice ${invoiceId} for ${total} is still showing as unpaid. No stress at all — whenever it suits, here's the easiest way to sort it:`
      : stage === 2
      ? `Nudge here, ${businessName}'s invoicing assistant. Following up on invoice ${invoiceId} for ${total} — it's now overdue and still showing unpaid on our end. I'd love to get this wrapped up; here's the quickest way:`
      : `Nudge here, writing on behalf of ${businessName}. This is a final reminder that invoice ${invoiceId} for ${total} remains unpaid and is now well past due. Please arrange payment using the options below, or reply so we can sort out anything outstanding:`;
  return `Hi ${clientFirst},\n\n${intro}`;
}
