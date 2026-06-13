import "server-only";
import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/server/auth";
import { adminBucket } from "@/lib/firebase/admin";
import { extractInvoiceFields } from "@/lib/extract-invoice";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return Response.json(
      { error: "PDF must be between 1 byte and 4 MB." },
      { status: 400 }
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  // Magic-byte check (don't trust the client's content-type).
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return Response.json({ error: "That doesn't look like a PDF." }, { status: 400 });
  }

  const uploadId = `users/${user.uid}/uploads/${randomUUID()}.pdf`;
  try {
    await adminBucket()
      .file(uploadId)
      .save(buffer, { contentType: "application/pdf" });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Could not store the file." },
      { status: 500 }
    );
  }

  // Extraction is best-effort — null just means the confirm screen starts blank.
  const fields = await extractInvoiceFields(buffer);
  return Response.json({ uploadId, fields });
}
