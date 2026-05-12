import { apiAuthError, authenticateEither } from "@/lib/server/auth";
import { getBusiness, getInvoice } from "@/lib/server/store";
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateEither(req);
  if (!auth.ok) return apiAuthError(auth);
  const { id } = await ctx.params;
  const [invoice, business] = await Promise.all([
    getInvoice(auth.uid, id),
    getBusiness(auth.uid),
  ]);
  if (!invoice) {
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  }
  const buffer = await renderInvoicePdf({
    business,
    invoice,
    paymentLinkUrl: invoice.paymentLinkUrl,
  });
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.id}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
