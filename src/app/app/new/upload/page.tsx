import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { UploadInvoiceWizard } from "@/components/upload-invoice-wizard";

export default async function UploadInvoicePage() {
  const { uid } = await requireOnboardedSession();
  const { business, clients, automations } = await getWorkspace(uid);
  const agentActive =
    automations.find((a) => a.id === "auto-remind")?.enabled ?? false;
  return (
    <UploadInvoiceWizard
      business={business}
      clients={clients}
      agentActive={agentActive}
    />
  );
}
