import { getState } from "@/lib/server/store";
import { AutomationsList } from "@/components/automations-list";

export default function SettingsAutomationsPage() {
  const { automations } = getState();
  return (
    <div>
      <p className="text-sm text-mute mb-6">
        Things that run on their own. Toggle off any time.
      </p>
      <AutomationsList automations={automations} />
    </div>
  );
}
