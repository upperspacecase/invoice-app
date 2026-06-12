export async function GET() {
  return Response.json({
    name: "Nudge API",
    version: "v1",
    auth: "Bearer <api key>",
    endpoints: {
      "GET /api/v1/clients": "List saved clients.",
      "POST /api/v1/clients":
        "Create a client. Body: { name, email, currency? }.",
      "GET /api/v1/invoices":
        "List invoices. Query: status=sent|paid, clientId, limit.",
      "POST /api/v1/invoices":
        "Create + send an invoice. Body: { clientId, amount, description?, currency?, termsDays? (0-365, default 14) | dueAt? (ms) }.",
      "POST /api/v1/invoices/{id}/remind":
        "Send the next due reminder stage for an unpaid invoice.",
      "POST /api/v1/invoices/{id}/paid":
        "Mark an invoice as paid.",
      "GET /api/v1/invoices/{id}/pdf":
        "Returns the invoice as application/pdf.",
      "GET /api/v1/fx":
        "Current FX rates (base: USD). Sourced from exchangerate.host with daily cache.",
    },
  });
}
