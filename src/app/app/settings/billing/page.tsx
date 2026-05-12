import { requireOnboardedSession } from "@/lib/server/auth";
import { getBusiness } from "@/lib/server/store";
import { BillingPlans } from "@/components/billing-plans";

export default async function SettingsBillingPage() {
  const { uid } = await requireOnboardedSession();
  const business = await getBusiness(uid);
  return (
    <BillingPlans
      current={business.tier}
      stripeAccountId={business.stripeAccountId}
    />
  );
}
