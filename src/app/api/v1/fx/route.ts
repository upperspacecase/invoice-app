import { authenticate, authError } from "@/lib/server/auth";
import { getRates } from "@/lib/fx";

export async function GET(req: Request) {
  const auth = authenticate(req);
  if (!auth.ok) return authError(auth);
  const snap = await getRates();
  return Response.json(snap);
}
