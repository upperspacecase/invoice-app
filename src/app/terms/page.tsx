import type { Metadata } from "next";
import { LegalShell, Section } from "@/app/legal/legal";

export const metadata: Metadata = {
  title: "Terms of Service — Nudge",
  description: "The terms for using Nudge.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="13 June 2026">
      <p>
        These terms govern your use of Nudge, an invoicing and payment
        follow-up service operated under nudgeinvoicing.pro (&quot;Nudge&quot;,
        &quot;we&quot;, &quot;us&quot;). By creating an account you agree to
        them.
      </p>

      <Section heading="What Nudge does">
        <p>
          Nudge lets you create or upload invoices, send them to your clients,
          and automatically follows up on unpaid invoices on your behalf. When
          you connect Stripe, Nudge can attach a payment link so your clients
          can pay online.
        </p>
      </Section>

      <Section heading="Fees">
        <p>
          Sending invoices and follow-ups is free. When an invoice is paid
          through a Nudge payment link, we charge a platform fee of 1% of the
          invoice amount, capped at the equivalent of £2,000 per calendar year
          per account. The 1% is collected automatically via Stripe.
        </p>
        <p>
          Card processing fees are charged separately by Stripe at their
          standard rates and are not set by or paid to Nudge. You are shown an
          estimate of your net amount before you send.
        </p>
      </Section>

      <Section heading="Your responsibilities">
        <p>
          You are responsible for the accuracy of your invoices, for having the
          right to bill the clients you add, and for complying with the tax and
          invoicing rules that apply to your business. You must not use Nudge to
          send unlawful, misleading, or harassing communications.
        </p>
      </Section>

      <Section heading="Payments and payouts">
        <p>
          Payments are processed by Stripe and settle into your own connected
          Stripe account. Nudge does not hold your funds. Stripe&apos;s terms
          also apply to your use of Stripe.
        </p>
      </Section>

      <Section heading="Availability and changes">
        <p>
          We aim to keep Nudge available but provide it &quot;as is&quot;
          without warranties. We may change or discontinue features, and may
          update these terms; material changes will be notified by email or in
          the app.
        </p>
      </Section>

      <Section heading="Liability">
        <p>
          To the extent permitted by law, Nudge is not liable for indirect or
          consequential losses, or for lost payments, business, or data. Nothing
          in these terms limits liability that cannot be limited by law.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms: hello@nudgeinvoicing.pro. These terms are
          governed by the laws of England and Wales.
        </p>
      </Section>
    </LegalShell>
  );
}
