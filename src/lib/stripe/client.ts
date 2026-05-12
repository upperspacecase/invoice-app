import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return client;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type StripePriceMap = {
  pro: string | null;
  getPaid: string | null;
};

export function priceIds(): StripePriceMap {
  return {
    pro: process.env.STRIPE_PRICE_PRO ?? null,
    getPaid: process.env.STRIPE_PRICE_GET_PAID ?? null,
  };
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://invoice-app-xi-eight.vercel.app"
  );
}
