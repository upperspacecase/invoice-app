import "server-only";
import { getStripe } from "./client";
import { currencyMeta } from "@/lib/currency";
import { PLATFORM_FEE_RATE } from "@/lib/platform-fee";
import type { Business, Invoice } from "@/lib/types";

export type LinkResult =
  | { ok: true; url: string; stripeLinkId: string; appliedFeeMinor: number }
  | { ok: false; reason: "not-configured" | "not-connected" | "failed"; detail: string };

// Creates a one-shot Stripe Payment Link on the connected account so the
// client pays into the tradie's bank, not the platform's. We attach an
// application_fee_amount = 1% (clamped to the remaining annual cap): it comes
// off automatically whatever method the client uses on the link — card or
// pay-by-bank — so there is never a separate bill. Which methods appear on the
// link is governed by what the connected account has enabled in Stripe.
export async function createInvoicePaymentLink(input: {
  business: Business;
  invoice: Invoice;
  // Remaining annual-cap room in minor units of the invoice currency. The fee
  // is the lesser of 1% and this. Omit for no cap (1% always applies).
  maxFeeMinor?: number;
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

    // 1% of the invoice in minor units, clamped to the remaining annual cap
    // room. Omitted from the link when it rounds to 0 (cap already reached).
    const onePercent = Math.round(
      input.invoice.amount * PLATFORM_FEE_RATE * scale
    );
    const feeMinor =
      input.maxFeeMinor != null
        ? Math.max(0, Math.min(onePercent, input.maxFeeMinor))
        : onePercent;

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

    return {
      ok: true,
      url: link.url,
      stripeLinkId: link.id,
      appliedFeeMinor: feeMinor,
    };
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "Stripe rejected the request",
    };
  }
}
