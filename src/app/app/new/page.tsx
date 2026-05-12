import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { NewInvoiceWizard } from "@/components/new-invoice-wizard";

export default async function NewInvoicePage() {
  const { uid } = await requireOnboardedSession();
  const { business, clients, integrations, featureVotes } = await getWorkspace(
    uid
  );
  const connected = integrations.filter((i) => i.connected).map((i) => i.id);
  return (
    <NewInvoiceWizard
      business={business}
      clients={clients}
      connectedIntegrations={connected}
      featureVotes={featureVotes}
    />
  );
}
