import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { IntegrationsList } from "@/components/integrations-list";

export default async function SettingsIntegrationsPage() {
  const { uid } = await requireOnboardedSession();
  const { integrations } = await getWorkspace(uid);

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Deliver invoices straight into your clients&apos; tools instead of
        email.
      </p>

      <IntegrationsList integrations={integrations} locked={false} />

      <p className="text-[11px] text-neutral-500 mt-6 leading-relaxed">
        Connect buttons toggle a demo state — wiring real OAuth requires
        registering each app and storing client secrets.
      </p>
    </div>
  );
}
