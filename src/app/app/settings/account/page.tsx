import Link from "next/link";
import { User } from "lucide-react";
import { requireSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { BusinessFields } from "@/components/business-fields";
import { CurrencyDefaultPicker } from "@/components/currency-default-picker";
import { FeatureBadge, FeatureLock } from "@/components/feature-lock";
import { FEATURES } from "@/lib/features";

export default async function SettingsAccountPage() {
  const { uid } = await requireSession();
  const { business, clients, featureVotes } = await getWorkspace(uid);
  const voted = (id: keyof typeof FEATURES) => featureVotes.includes(id);

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-mute mb-4">
        Your details
      </div>
      <BusinessFields business={business} />

      <div className="flex items-center justify-between mt-10 mb-4">
        <div className="text-xs uppercase tracking-widest text-mute">
          Default currency
        </div>
        <FeatureBadge
          feature="multi-currency"
          userTier={business.tier}
          voted={voted("multi-currency")}
        />
      </div>
      <FeatureLock
        feature="multi-currency"
        userTier={business.tier}
        voted={voted("multi-currency")}
      >
        <CurrencyDefaultPicker current={business.currency} />
      </FeatureLock>

      <div className="flex items-center justify-between mt-10 mb-4">
        <div className="text-xs uppercase tracking-widest text-mute">
          Branding
        </div>
        <FeatureBadge
          feature="branded-invoice"
          userTier={business.tier}
          voted={voted("branded-invoice")}
        />
      </div>
      <div className="rounded-xl border border-rule p-4 bg-card text-sm text-mute">
        Logo and brand color on every PDF. Trust signal for bigger clients.
      </div>

      <div className="flex items-center justify-between mt-10 mb-4">
        <div className="text-xs uppercase tracking-widest text-mute">
          Late-fee policy
        </div>
        <FeatureBadge
          feature="late-fee-policy"
          userTier={business.tier}
          voted={voted("late-fee-policy")}
        />
      </div>
      <div className="rounded-xl border border-rule p-4 bg-card text-sm text-mute">
        Set <span className="font-mono">5% if 14 days overdue</span> once;
        applied automatically.
      </div>

      <div className="text-xs uppercase tracking-widest text-mute mb-4 mt-10">
        Saved clients ({clients.length})
      </div>
      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.id}>
            <Link
              href={`/app/clients/${c.id}`}
              className="p-3 rounded-xl bg-card border border-rule flex items-center gap-3 hover:border-ink/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-xs text-mute truncate">{c.email}</div>
              </div>
              <div className="text-xs text-mute font-mono">{c.currency}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
