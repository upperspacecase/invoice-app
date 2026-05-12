import Link from "next/link";
import { FileText, Bot } from "lucide-react";
import { requireSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { ApiKeysPanel } from "@/components/api-keys-panel";
import { TIER_LABEL, FEATURES } from "@/lib/features";
import { TIER_RANK } from "@/lib/types";

export default async function SettingsDevelopersPage() {
  const { uid } = await requireSession();
  const { business, apiKeys } = await getWorkspace(uid);
  const meta = FEATURES["agent-api"];
  const inPlan = TIER_RANK[business.tier] >= TIER_RANK[meta.tier];

  return (
    <div>
      <p className="text-sm text-mute mb-6">
        Give an AI agent a key. It can list clients, draft invoices, send them,
        and follow up — same as the app.
      </p>

      {!inPlan && (
        <div
          className="rounded-xl border p-4 mb-6 flex items-center justify-between gap-3"
          style={{
            background: "rgba(196,78,44,0.06)",
            borderColor: "rgba(196,78,44,0.25)",
          }}
        >
          <div className="text-xs">
            <div className="font-medium text-ink">
              Agent API is part of {TIER_LABEL[meta.tier]}
            </div>
            <div className="text-mute mt-0.5">
              Generate keys and let an agent send invoices through your account.
            </div>
          </div>
          <Link
            href="/app/settings/billing"
            className="text-xs px-3 py-2 rounded-md bg-ink text-paper font-medium whitespace-nowrap"
          >
            Upgrade to {TIER_LABEL[meta.tier]}
          </Link>
        </div>
      )}

      <ApiKeysPanel keys={apiKeys} locked={!inPlan} />

      <div className="text-xs uppercase tracking-widest text-mute mt-10 mb-3">
        Quick start
      </div>
      <pre className="bg-ink text-[#e6e6e6] rounded-xl p-4 text-xs font-mono leading-relaxed overflow-auto whitespace-pre">
{`# Send an invoice
curl -X POST $HOST/api/v1/invoices \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"clientId":"acme","amount":1250,"currency":"USD"}'`}
      </pre>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <a
          href="/api/v1"
          className="inline-flex items-center gap-1.5 text-ink underline underline-offset-4"
        >
          <FileText size={14} /> API docs
        </a>
        <span className="inline-flex items-center gap-1.5 text-mute">
          <Bot size={14} /> MCP server
          <span className="text-[10px] uppercase tracking-widest ml-1">
            Soon
          </span>
        </span>
      </div>
    </div>
  );
}
