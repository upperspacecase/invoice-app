import { authenticate, authError } from "@/lib/server/auth";
import { remindInvoice } from "@/lib/server/store";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = authenticate(req);
  if (!auth.ok) return authError(auth);
  const { id } = await ctx.params;
  const inv = remindInvoice(id, "agent");
  if (!inv) {
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  }
  return Response.json({ invoice: inv });
}
