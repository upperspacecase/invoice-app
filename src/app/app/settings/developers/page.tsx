import { FileText, Bot } from "lucide-react";
import { requireSession } from "@/lib/server/auth";
import { listApiKeys } from "@/lib/server/store";
import { ApiKeysPanel } from "@/components/api-keys-panel";

export default async function SettingsDevelopersPage() {
  const { uid } = await requireSession();
  const apiKeys = await listApiKeys(uid);

  return (
    <div>
      <p className="text-sm text-mute mb-6">
        Give an AI agent a key. It can list clients, draft invoices, send them,
        and follow up — same as the app.
      </p>

      <ApiKeysPanel keys={apiKeys} />

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
