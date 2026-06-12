import type { FollowupStage } from "./types";

// The exact staged follow-up message Nudge sends as the invoicing assistant
// (the no-LLM-key fallback). Stage 0 is a pre-due heads-up; 1 polite, 2 firm,
// 3 final. Greeting included; the caller appends pay link, payment details and
// sign-off. References ONLY the real due date it is given.
export function followupBody(args: {
  businessName: string;
  clientFirst: string;
  invoiceId: string;
  total: string;
  dueDate: string;
  stage: FollowupStage;
}): string {
  const { businessName, clientFirst, invoiceId, total, dueDate, stage } = args;
  const intro =
    stage === 0
      ? `I'm Nudge, ${businessName}'s invoicing assistant. Just a friendly heads-up that invoice ${invoiceId} for ${total} is due on ${dueDate} — no action needed if it's already scheduled. If it's easier to clear it now, here's how:`
      : stage === 1
      ? `I'm Nudge, ${businessName}'s invoicing assistant — I keep things tidy on their behalf. A gentle reminder that invoice ${invoiceId} for ${total} (due ${dueDate}) is showing as unpaid. No stress at all — whenever it suits, here's the easiest way to sort it:`
      : stage === 2
      ? `Nudge here, ${businessName}'s invoicing assistant. Following up on invoice ${invoiceId} for ${total}, which was due ${dueDate} and is still showing unpaid on our end. I'd love to get this wrapped up; here's the quickest way:`
      : `Nudge here, writing on behalf of ${businessName}. This is a final reminder that invoice ${invoiceId} for ${total}, due ${dueDate}, remains unpaid and is now well past due. Please arrange payment using the options below, or reply so we can sort out anything outstanding:`;
  return `Hi ${clientFirst},\n\n${intro}`;
}
