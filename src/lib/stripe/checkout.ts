import "server-only";
import { appBaseUrl, getStripe, priceIds } from "./client";
import type { Tier } from "@/lib/types";

export type CheckoutResult =
  | { ok: true; url: string }
  | {
      ok: false;
      reason: "not-configured" | "no-price" | "failed";
      detail: string;
    };

export async function createSubscriptionCheckout(input: {
  uid: string;
  email: string;
  tier: Exclude<Tier, "send">;
  existingCustomerId?: string;
}): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "STRIPE_SECRET_KEY missing",
    };
  }
  const ids = priceIds();
  const price = input.tier === "pro" ? ids.pro : ids.getPaid;
  if (!price) {
    return {
      ok: false,
      reason: "no-price",
      detail: `Set STRIPE_PRICE_${input.tier === "pro" ? "PRO" : "GET_PAID"} in env`,
    };
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${appBaseUrl()}/app/settings/billing?stripe=success`,
      cancel_url: `${appBaseUrl()}/app/settings/billing?stripe=cancel`,
      customer: input.existingCustomerId,
      customer_email: input.existingCustomerId ? undefined : input.email,
      client_reference_id: input.uid,
      subscription_data: { metadata: { uid: input.uid, tier: input.tier } },
      metadata: { uid: input.uid, tier: input.tier },
      allow_promotion_codes: true,
    });
    if (!session.url) {
      return {
        ok: false,
        reason: "failed",
        detail: "Stripe returned no Checkout URL",
      };
    }
    return { ok: true, url: session.url };
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "Stripe rejected the request",
    };
  }
}
