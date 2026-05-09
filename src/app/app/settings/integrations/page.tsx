import { getState } from "@/lib/server/store";
import { IntegrationsList } from "@/components/integrations-list";

export default function SettingsIntegrationsPage() {
  const { integrations } = getState();

  return (
    <div>
      <p className="text-sm text-mute mb-6">
        Deliver invoices straight into your clients&apos; tools instead of
        email.
      </p>
      <IntegrationsList integrations={integrations} />
      <p className="text-[11px] text-mute mt-6 leading-relaxed">
        Connect buttons toggle a demo state — wiring real OAuth requires
        registering each app and storing client secrets.
      </p>
    </div>
  );
}
