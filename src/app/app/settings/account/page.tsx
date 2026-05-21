import Link from "next/link";
import { User } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { BusinessFields } from "@/components/business-fields";
import { CurrencyDefaultPicker } from "@/components/currency-default-picker";
import { FeatureBadge, FeatureLock, featureStatus } from "@/components/feature-lock";
import { FEATURES } from "@/lib/features";
import { BrandColorPicker } from "@/components/brand-color-picker";

export default async function SettingsAccountPage() {
  const { uid } = await requireOnboardedSession();
  const { business, clients, featureVotes } = await getWorkspace(uid);
  const voted = (id: keyof typeof FEATURES) => featureVotes.includes(id);

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
        Your details
      </div>
      <BusinessFields business={business} />

      <div className="flex items-center justify-between mt-10 mb-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          Default currency
        </div>
        <FeatureBadge
          feature="multi-currency"
          voted={voted("multi-currency")}
        />
      </div>
      <FeatureLock feature="multi-currency" voted={voted("multi-currency")}>
        <CurrencyDefaultPicker current={business.currency} />
      </FeatureLock>

      <div className="flex items-center justify-between mt-10 mb-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          Branding
        </div>
        <FeatureBadge
          feature="branded-invoice"
          voted={voted("branded-invoice")}
        />
      </div>
      <BrandColorPicker
        current={business.brandColor}
        disabled={featureStatus("branded-invoice") !== "allowed"}
      />
      <p className="text-[11px] text-neutral-500 mt-2">
        Logo upload coming soon — click the badge above to vote.
      </p>

      <div className="flex items-center justify-between mt-10 mb-4">
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          Late-fee policy
        </div>
        <FeatureBadge
          feature="late-fee-policy"
          voted={voted("late-fee-policy")}
        />
      </div>
      <div className="rounded-xl border border-neutral-200 p-4 bg-white text-sm text-neutral-500">
        Set <span className="font-mono">5% if 14 days overdue</span> once;
        applied automatically.
      </div>

      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-4 mt-10">
        Saved clients ({clients.length})
      </div>
      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id}>
            <Link
              href={`/app/clients/${c.id}`}
              className="p-3 rounded-xl bg-white border border-neutral-200 flex items-center gap-3 hover:border-neutral-400 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-xs text-neutral-500 truncate">{c.email}</div>
              </div>
              <div className="text-xs text-neutral-500 font-mono">{c.currency}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
