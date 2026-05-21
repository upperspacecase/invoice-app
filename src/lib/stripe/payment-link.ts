import "server-only";
import { getStripe } from "./client";
import { currencyMeta } from "@/lib/currency";
import type { Business, Invoice } from "@/lib/types";

export type LinkResult =
  | { ok: true; url: string; stripeLinkId: string }
  | { ok: false; reason: "not-configured" | "not-connected" | "failed"; detail: string };

// Our pricing: a flat 1% of every invoice paid through the platform.
const PLATFORM_FEE_RATE = 0.01;

// Creates a one-shot Stripe Payment Link on behalf of the connected account
// so the client pays into the user's bank, not the platform's. The platform
// collects its 1% as the Connect application fee on the charge.
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
    const unitAmount = Math.round(
      input.invoice.amount * Math.pow(10, meta.decimals)
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

    const applicationFee = Math.round(unitAmount * PLATFORM_FEE_RATE);
    const link = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        ...(applicationFee > 0
          ? { application_fee_amount: applicationFee }
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
