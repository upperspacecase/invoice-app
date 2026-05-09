import { getState } from "@/lib/server/store";
import { NewInvoiceWizard } from "@/components/new-invoice-wizard";

export default async function NewInvoicePage() {
  const { business, clients, integrations } = getState();
  const connected = integrations
    .filter((i) => i.connected)
    .map((i) => i.id);
  return (
    <NewInvoiceWizard
      business={business}
      clients={clients}
      connectedIntegrations={connected}
    />
  );
}
