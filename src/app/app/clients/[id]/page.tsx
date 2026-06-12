import { notFound } from "next/navigation";
import { requireOnboardedSession } from "@/lib/server/auth";
import { getClient } from "@/lib/server/store";
import { ClientEditForm } from "@/components/client-edit-form";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { uid } = await requireOnboardedSession();
  const { id } = await params;
  const client = await getClient(uid, id);
  if (!client) notFound();
  return <ClientEditForm client={client} />;
}
