import { apiAuthError, authenticateApi } from "@/lib/server/auth";
import { getRates } from "@/lib/fx";

export async function GET(req: Request) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return apiAuthError(auth);
  const snap = await getRates();
  return Response.json(snap);
}
