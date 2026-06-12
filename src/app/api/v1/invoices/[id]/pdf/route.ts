import { apiAuthError, authenticateEither } from "@/lib/server/auth";
import { getBusiness, getInvoice } from "@/lib/server/store";
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { adminBucket } from "@/lib/firebase/admin";
import { displayId } from "@/lib/invoice-display";

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
  // Uploaded invoices serve the tradie's own stored PDF; fall back to rendering
  // if the stored file is missing.
  let buffer: Buffer | null = null;
  if (invoice.pdfPath) {
    try {
      [buffer] = await adminBucket().file(invoice.pdfPath).download();
    } catch {
      buffer = null;
    }
  }
  if (!buffer) {
    buffer = await renderInvoicePdf({
      business,
      invoice,
      paymentLinkUrl: invoice.paymentLinkUrl,
    });
  }
  const filename = `${displayId(invoice)}.pdf`.replace(/[^\w.#-]/g, "_");
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
