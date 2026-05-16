// TEMP debug endpoint — surfaces errors that get scrubbed in production.
// Authed by session cookie. Returns the same data getWorkspace returns,
// or the error message + stack on failure. Remove after debugging is done.

import { getSessionUser } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json(
      { ok: false, stage: "auth", error: "Not signed in." },
      { status: 401 }
    );
  }
  try {
    const ws = await getWorkspace(user.uid);
    return Response.json({
      ok: true,
      uid: user.uid,
      shape: {
        business: Object.keys(ws.business),
        clients: ws.clients.length,
        invoices: ws.invoices.length,
        integrations: ws.integrations.length,
        automations: ws.automations.length,
        apiKeys: ws.apiKeys.length,
        activity: ws.activity.length,
        featureVotes: ws.featureVotes.length,
      },
      business: ws.business,
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        stage: "getWorkspace",
        uid: user.uid,
        error: e instanceof Error ? e.message : String(e),
        name: e instanceof Error ? e.name : null,
        stack: e instanceof Error ? e.stack : null,
      },
      { status: 500 }
    );
  }
}
