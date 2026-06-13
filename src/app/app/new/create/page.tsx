import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { NewInvoiceWizard } from "@/components/new-invoice-wizard";

export default async function CreateInvoicePage() {
  const { uid } = await requireOnboardedSession();
  const { business, clients, automations } = await getWorkspace(uid);
  const agentActive =
    automations.find((a) => a.id === "auto-remind")?.enabled ?? false;
  return (
    <NewInvoiceWizard
      business={business}
      clients={clients}
      agentActive={agentActive}
    />
  );
}
