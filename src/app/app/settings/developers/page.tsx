import { FileText, Bot } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";
import { getWorkspace } from "@/lib/server/store";
import { ApiKeysPanel } from "@/components/api-keys-panel";

export default async function SettingsDevelopersPage() {
  const { uid } = await requireOnboardedSession();
  const { apiKeys } = await getWorkspace(uid);

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-6">
        Give an AI agent a key. It can list clients, draft invoices, send them,
        and follow up — same as the app.
      </p>

      <ApiKeysPanel keys={apiKeys} locked={false} />

      <div className="text-xs uppercase tracking-widest text-neutral-500 mt-10 mb-3">
        Quick start
      </div>
      <pre className="bg-black text-[#e6e6e6] rounded-xl p-4 text-xs font-mono leading-relaxed overflow-auto whitespace-pre">
{`# Send an invoice
curl -X POST $HOST/api/v1/invoices \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"clientId":"acme","amount":1250,"currency":"USD"}'`}
      </pre>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <a
          href="/api/v1"
          className="inline-flex items-center gap-1.5 text-black underline underline-offset-4"
        >
          <FileText size={14} /> API docs
        </a>
        <span className="inline-flex items-center gap-1.5 text-neutral-500">
          <Bot size={14} /> MCP server
          <span className="text-[10px] uppercase tracking-widest ml-1">
            Soon
          </span>
        </span>
      </div>
    </div>
  );
}
