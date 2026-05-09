import { apiAuthError, authenticateApi } from "@/lib/server/auth";
import { markInvoicePaid } from "@/lib/server/store";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return apiAuthError(auth);
  const { id } = await ctx.params;
  const inv = await markInvoicePaid(auth.uid, id, "agent");
  if (!inv) {
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  }
  return Response.json({ invoice: inv });
}
