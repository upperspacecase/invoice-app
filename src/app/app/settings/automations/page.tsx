import { requireSession } from "@/lib/server/auth";
import { listAutomations } from "@/lib/server/store";
import { AutomationsList } from "@/components/automations-list";

export default async function SettingsAutomationsPage() {
  const { uid } = await requireSession();
  const automations = await listAutomations(uid);
  return (
    <div>
      <p className="text-sm text-mute mb-6">
        Things that run on their own. Toggle off any time.
      </p>
      <AutomationsList automations={automations} />
    </div>
  );
}
