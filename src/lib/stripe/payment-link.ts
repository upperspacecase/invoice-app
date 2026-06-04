import "server-only";
import { getStripe } from "./client";
import { currencyMeta } from "@/lib/currency";
import type { Business, Invoice } from "@/lib/types";

export type LinkResult =
  | { ok: true; url: string; stripeLinkId: string }
  | { ok: false; reason: "not-configured" | "not-connected" | "failed"; detail: string };

// Nudge's whole price: 1% of an invoice, taken only when it actually gets
// paid, capped so a big month doesn't punish the tradie. Validate the cap on
// real users before treating these as final.
const PLATFORM_FEE_RATE = 0.01; // 1%
const PLATFORM_FEE_CAP_MAJOR = 20; // cap per invoice, in major currency units

// Creates a one-shot Stripe Payment Link on the connected account so the
// client pays into the tradie's bank, not the platform's. We attach an
// application_fee_amount = 1% (capped): it comes off automatically whatever
// method the client uses on the link — card or pay-by-bank — so there is never
// a separate bill. Which methods appear on the link is governed by what the
// connected account has enabled in its Stripe dashboard.
export async function createInvoicePaymentLink(input: {
  business: Business;
  invoice: Invoice;
}): Promise<LinkResult> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "STRIPE_SECRET_KEY missing",
    };
  }
  const accountId = input.business.stripeAccountId;
  if (!accountId) {
    return {
      ok: false,
      reason: "not-connected",
      detail: "User hasn't connected Stripe yet",
    };
  }
  try {
    const meta = currencyMeta(input.invoice.currency);
    // unit_amount is minor units; JPY has 0 decimals.
    const scale = Math.pow(10, meta.decimals);
    const unitAmount = Math.round(input.invoice.amount * scale);

    // 1% of the invoice, capped, in minor units. Omitted when it rounds to 0.
    const feeMinor = Math.min(
      Math.round(input.invoice.amount * PLATFORM_FEE_RATE * scale),
      Math.round(PLATFORM_FEE_CAP_MAJOR * scale)
    );

    const product = await stripe.products.create(
      {
        name: `Invoice ${input.invoice.id}`,
        metadata: {
          invoiceId: input.invoice.id,
          uid: input.invoice.clientId,
        },
      },
      { stripeAccount: accountId }
    );

    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: unitAmount,
        currency: input.invoice.currency.toLowerCase(),
      },
      { stripeAccount: accountId }
    );

    const link = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        ...(feeMinor > 0
          ? { application_fee_amount: feeMinor }
          : {}),
        metadata: {
          invoiceId: input.invoice.id,
        },
      },
      { stripeAccount: accountId }
    );

    return { ok: true, url: link.url, stripeLinkId: link.id };
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "Stripe rejected the request",
    };
  }
}
