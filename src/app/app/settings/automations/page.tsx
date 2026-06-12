import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { AutomationsList } from "@/components/automations-list";

export default async function SettingsAutomationsPage() {
  const { uid } = await requireOnboardedSession();
  const { automations } = await getWorkspace(uid);
  return (
    <div>
      <p className="text-sm text-mute mb-6">
        Things Nudge runs on its own. Toggle off any time.
      </p>
      <AutomationsList automations={automations} />
    </div>
  );
}
