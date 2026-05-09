import { notFound } from "next/navigation";
import { requireSession } from "@/lib/server/auth";
import { getClient, listIntegrations } from "@/lib/server/store";
import { ClientEditForm } from "@/components/client-edit-form";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { uid } = await requireSession();
  const { id } = await params;
  const [client, integrations] = await Promise.all([
    getClient(uid, id),
    listIntegrations(uid),
  ]);
  if (!client) notFound();
  return <ClientEditForm client={client} integrations={integrations} />;
}
