import { apiAuthError, authenticateApi } from "@/lib/server/auth";
import { createClient, listClients } from "@/lib/server/store";
import { isCurrencyCode } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/types";

export async function GET(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return apiAuthError(auth);
  return Response.json({ clients: await listClients(auth.uid) });
}

export async function POST(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return apiAuthError(auth);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Body must be a JSON object." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || !b.name.trim()) {
    return Response.json({ error: "name is required." }, { status: 400 });
  }
  if (typeof b.email !== "string" || !b.email.trim()) {
    return Response.json({ error: "email is required." }, { status: 400 });
  }
  if (b.currency !== undefined && !isCurrencyCode(b.currency)) {
    return Response.json({ error: "Bad currency." }, { status: 400 });
  }

  const client = await createClient(auth.uid, {
    name: b.name.trim(),
    email: b.email.trim(),
    currency: isCurrencyCode(b.currency) ? (b.currency as CurrencyCode) : undefined,
  });
  return Response.json({ client }, { status: 201 });
}
