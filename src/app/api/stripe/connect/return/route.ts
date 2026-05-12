import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/auth";
import { getBusiness, logActivity, updateBusiness } from "@/lib/server/store";
import { connectedAccountReady } from "@/lib/stripe/connect";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/signin?from=/app/settings/billing");
  }
  const url = new URL(req.url);
  const accountId = url.searchParams.get("account");
  if (!accountId) {
    redirect("/app/settings/billing?stripe=missing-account");
  }
  const business = await getBusiness(user.uid);
  if (business.stripeAccountId && business.stripeAccountId !== accountId) {
    redirect("/app/settings/billing?stripe=account-mismatch");
  }
  if (!business.stripeAccountId) {
    await updateBusiness(user.uid, { stripeAccountId: accountId });
  }
  const status = await connectedAccountReady(accountId);
  await logActivity(
    user.uid,
    "system",
    status.ready
      ? `Stripe Connect ready (${accountId})`
      : `Stripe Connect onboarding incomplete (${accountId})`,
    status.detail
  );
  redirect(
    status.ready
      ? "/app/settings/billing?stripe=connected"
      : "/app/settings/billing?stripe=incomplete"
  );
}
