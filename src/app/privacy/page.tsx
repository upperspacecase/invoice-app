import type { Metadata } from "next";
import { LegalShell, Section } from "@/app/legal/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Nudge",
  description: "How Nudge handles your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="13 June 2026">
      <p>
        This policy explains what data Nudge collects and how we use it. We aim
        to collect only what we need to run the service.
      </p>

      <Section heading="What we collect">
        <p>
          Account data (your name, email, business details and payment terms);
          the clients you add (name and email); invoice details and any PDF you
          upload; and activity needed to send invoices and follow-ups. When you
          connect Stripe, we store your Stripe account identifier — not your
          card or bank details.
        </p>
      </Section>

      <Section heading="How we use it">
        <p>
          To create and deliver invoices, follow up on unpaid ones, attach
          payment links, and show you your ledger. Uploaded invoice PDFs may be
          sent to our AI provider to extract their details for you to confirm.
        </p>
      </Section>

      <Section heading="Processors we use">
        <p>
          We share data only with the providers needed to run Nudge: Firebase
          (Google) for accounts and storage, Stripe for payments, Resend for
          email delivery, Anthropic for invoice reading, and Vercel for hosting.
          Each processes data on our behalf under their own terms.
        </p>
      </Section>

      <Section heading="Retention and your rights">
        <p>
          We keep your data while your account is active. You can request a copy
          of your data or its deletion by emailing us. Depending on where you
          live, you may have rights under the UK GDPR or similar laws to access,
          correct, or delete your data.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Privacy questions or data requests: hello@nudgeinvoicing.pro.
        </p>
      </Section>
    </LegalShell>
  );
}
