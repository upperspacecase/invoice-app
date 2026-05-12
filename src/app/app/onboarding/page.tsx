import { redirect } from "next/navigation";
import { requireSession } from "@/lib/server/auth";
import { getBusiness } from "@/lib/server/store";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const { uid } = await requireSession();
  const business = await getBusiness(uid);
  if (business.onboarded) redirect("/app");
  return <OnboardingForm initial={business} />;
}
