import Link from "next/link";
import { User } from "lucide-react";
import { getState } from "@/lib/server/store";
import { BusinessFields } from "@/components/business-fields";
import { CurrencyDefaultPicker } from "@/components/currency-default-picker";

export default function SettingsAccountPage() {
  const { business, clients } = getState();

  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-mute mb-4">
        Your details
      </div>
      <BusinessFields business={business} />

      <div className="text-xs uppercase tracking-widest text-mute mb-4 mt-10">
        Default currency
      </div>
      <CurrencyDefaultPicker current={business.currency} />

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
