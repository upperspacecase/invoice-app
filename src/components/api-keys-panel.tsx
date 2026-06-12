"use client";

import { useState, useTransition } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { createApiKeyAction, deleteApiKeyAction } from "@/app/_actions";
import type { ApiKey } from "@/lib/types";

export function ApiKeysPanel({ keys }: { keys: ApiKey[] }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<{ id: string; token: string } | null>(
    null
  );
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function submit() {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const created = await createApiKeyAction(name.trim());
        setRevealed({ id: created.meta.id, token: created.token });
        setCreating(false);
        setName("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function remove(id: string) {
    setDeletingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await deleteApiKeyAction(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest text-mute">
          API keys
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="text-xs px-3 py-1.5 rounded-md bg-ink text-paper inline-flex items-center gap-1.5 hover:bg-ink/90"
          >
            <Plus size={13} />
            New key
          </button>
        )}
      </div>

      {creating && (
        <div className="p-3 rounded-xl border border-rule bg-card mb-3">
          <input
            type="text"
            placeholder="e.g. Claude agent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") {
                setCreating(false);
                setName("");
              }
            }}
            className="w-full h-9 px-2 outline-none bg-transparent border-b border-rule focus:border-ink/40 text-sm"
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              className="text-xs px-3 py-1.5 text-mute hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !name.trim()}
              className="text-xs px-3 py-1.5 rounded-md bg-ink text-paper disabled:opacity-40"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {revealed && (
        <div className="p-4 rounded-xl border border-ink bg-ink/[0.03] mb-3">
          <div className="text-xs uppercase tracking-widest text-mute mb-2">
            Copy this now — it won&apos;t be shown again
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs break-all">
              {revealed.token}
            </code>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(revealed.token);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* ignore */
                }
              }}
              className="text-xs px-2 py-1 rounded-md bg-ink text-paper hover:bg-ink/90"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setRevealed(null)}
            className="text-xs text-mute mt-3 hover:text-ink"
          >
            Done
          </button>
        </div>
      )}

      {error && <div className="text-xs text-danger mb-3">{error}</div>}

      {keys.length === 0 && !creating && (
        <div className="p-6 rounded-xl border border-rule bg-card text-center text-xs text-mute">
          No API keys yet.
        </div>
      )}

      <div className="space-y-2">
        {keys.map((k) => (
          <div
            key={k.id}
            className="p-4 rounded-xl border border-rule bg-card"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{k.name}</div>
                <div className="font-mono text-xs text-mute mt-1">
                  {k.prefix}
                </div>
              </div>
              <div className="flex gap-1 text-mute">
                <button
                  type="button"
                  aria-label="Copy prefix"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(k.prefix);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-ink/5"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Revoke"
                  onClick={() => remove(k.id)}
                  disabled={deletingId === k.id}
                  className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-ink/5 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-mute">
              <span>
                Last used{" "}
                <span className="text-ink">
                  {k.lastUsedAt
                    ? new Date(k.lastUsedAt).toLocaleString()
                    : "Never"}
                </span>
              </span>
              <span>
                Created {new Date(k.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
