import Link from "next/link";
import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { IntegrationsList } from "@/components/integrations-list";
import { TIER_LABEL, FEATURES } from "@/lib/features";
import { TIER_RANK } from "@/lib/types";

export default async function SettingsIntegrationsPage() {
  const { uid } = await requireOnboardedSession();
  const { business, integrations } = await getWorkspace(uid);
  const meta = FEATURES.integrations;
  const inPlan = TIER_RANK[business.tier] >= TIER_RANK[meta.tier];

  return (
    <div>
      <p className="text-sm text-mute mb-4">
        Deliver invoices straight into your clients&apos; tools instead of
        email.
      </p>

      {!inPlan && (
        <div
          className="rounded-xl border p-4 mb-4 flex items-center justify-between gap-3"
          style={{
            background: "rgba(196,78,44,0.06)",
            borderColor: "rgba(196,78,44,0.25)",
          }}
        >
          <div className="text-xs">
            <div className="font-medium text-ink">
              Integrations are part of {TIER_LABEL[meta.tier]}
            </div>
            <div className="text-mute mt-0.5">
              Send-tier delivers via email. Upgrade for QuickBooks, Xero, Slack
              and webhooks.
            </div>
          </div>
          <Link
            href="/app/settings/billing"
            className="text-xs px-3 py-2 rounded-md bg-ink text-paper font-medium whitespace-nowrap"
          >
            Upgrade to {TIER_LABEL[meta.tier]}
          </Link>
        </div>
      )}

      <IntegrationsList integrations={integrations} locked={!inPlan} />

      <p className="text-[11px] text-mute mt-6 leading-relaxed">
        Connect buttons toggle a demo state — wiring real OAuth requires
        registering each app and storing client secrets.
      </p>
    </div>
  );
}
