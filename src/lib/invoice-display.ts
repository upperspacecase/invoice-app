// The number shown to humans: the tradie's own invoice number when an uploaded
// invoice carried one, otherwise Nudge's internal INV-xxx id. Routing and
// Firestore always key off `id`. Client-safe (no server-only import).
export function displayId(inv: {
  id: string;
  externalNumber?: string;
}): string {
  const ext = inv.externalNumber?.trim();
  return ext ? ext : inv.id;
}
