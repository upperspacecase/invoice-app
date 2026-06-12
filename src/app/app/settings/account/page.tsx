import Link from "next/link";
import { User } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { BusinessFields } from "@/components/business-fields";
import { CurrencyDefaultPicker } from "@/components/currency-default-picker";
import { BrandColorPicker } from "@/components/brand-color-picker";

export default async function SettingsAccountPage() {
  const { uid } = await requireOnboardedSession();
  const { business, clients } = await getWorkspace(uid);

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-mute mb-4">
        Your details
      </div>
      <BusinessFields business={business} />

      <div className="text-xs uppercase tracking-widest text-mute mt-10 mb-4">
        Default currency
      </div>
      <CurrencyDefaultPicker current={business.currency} />

      <div className="text-xs uppercase tracking-widest text-mute mt-10 mb-4">
        Branding
      </div>
      <BrandColorPicker current={business.brandColor} />
      <p className="text-[11px] text-mute mt-2">Logo upload coming soon.</p>

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
