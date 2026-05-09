import { notFound } from "next/navigation";
import { getClient, listIntegrations } from "@/lib/server/store";
import { ClientEditForm } from "@/components/client-edit-form";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();
  const integrations = listIntegrations();
  return <ClientEditForm client={client} integrations={integrations} />;
}
