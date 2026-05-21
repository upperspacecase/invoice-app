import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { AutomationsList } from "@/components/automations-list";

export default async function SettingsAutomationsPage() {
  const { uid } = await requireOnboardedSession();
  const { automations, featureVotes } = await getWorkspace(uid);
  return (
    <div>
      <p className="text-sm text-neutral-500 mb-6">
        Things that run on their own. Toggle off any time.
      </p>
      <AutomationsList automations={automations} votes={featureVotes} />
    </div>
  );
}
