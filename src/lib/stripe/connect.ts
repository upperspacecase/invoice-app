import "server-only";
import { getStripe, appBaseUrl } from "./client";

export type ConnectFlow =
  | {
      ok: true;
      accountId: string;
      onboardingUrl: string;
    }
  | { ok: false; reason: "not-configured" | "failed"; detail: string };

// Creates (or reuses) a Stripe Connect Express account for the user and
// returns an Account Link the UI redirects to. Stripe drives onboarding;
// when done, Stripe redirects to /app/settings/payments/return which calls
// finalizeConnectedAccount() to mark the account ready.
export async function startConnectFlow(input: {
  uid: string;
  email: string;
  businessName: string;
  existingAccountId?: string;
}): Promise<ConnectFlow> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      reason: "not-configured",
      detail: "STRIPE_SECRET_KEY missing",
    };
  }
  try {
    const accountId =
      input.existingAccountId ??
      (
        await stripe.accounts.create({
          type: "express",
          email: input.email,
          business_profile: { name: input.businessName },
          metadata: { uid: input.uid },
        })
      ).id;

    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${appBaseUrl()}/app/settings/billing?stripe=refresh`,
      return_url: `${appBaseUrl()}/api/stripe/connect/return?account=${accountId}`,
    });

    return { ok: true, accountId, onboardingUrl: link.url };
  } catch (e) {
    return {
      ok: false,
      reason: "failed",
      detail: e instanceof Error ? e.message : "Stripe Connect failed",
    };
  }
}

// Returns whether the connected account has finished onboarding (charges
// enabled / payouts enabled). Used by the callback route to decide whether
// to mark the business doc as ready.
export async function connectedAccountReady(
  accountId: string
): Promise<{ ready: boolean; detail: string }> {
  const stripe = getStripe();
  if (!stripe) return { ready: false, detail: "STRIPE_SECRET_KEY missing" };
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return {
      ready: Boolean(account.charges_enabled && account.payouts_enabled),
      detail:
        account.charges_enabled && account.payouts_enabled
          ? "ready"
          : "onboarding incomplete",
    };
  } catch (e) {
    return {
      ready: false,
      detail: e instanceof Error ? e.message : "fetch failed",
    };
  }
}
