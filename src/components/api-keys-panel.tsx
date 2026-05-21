"use client";

import { useState, useTransition } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { createApiKeyAction, deleteApiKeyAction } from "@/app/_actions";
import type { ApiKey } from "@/lib/types";

export function ApiKeysPanel({
  keys,
  locked = false,
}: {
  keys: ApiKey[];
  locked?: boolean;
}) {
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
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          API keys
        </div>
        {!creating && !locked && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="text-xs px-3 py-1.5 rounded-md bg-black text-white inline-flex items-center gap-1.5 hover:bg-neutral-800"
          >
            <Plus size={13} />
            New key
          </button>
        )}
      </div>

      {creating && (
        <div className="p-3 rounded-xl border border-neutral-200 bg-white mb-3">
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
            className="w-full h-9 px-2 outline-none bg-transparent border-b border-neutral-200 focus:border-neutral-400 text-sm"
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              className="text-xs px-3 py-1.5 text-neutral-500 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !name.trim()}
              className="text-xs px-3 py-1.5 rounded-md bg-black text-white disabled:opacity-40"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {revealed && (
        <div className="p-4 rounded-xl border border-black bg-neutral-50 mb-3">
          <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">
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
              className="text-xs px-2 py-1 rounded-md bg-black text-white hover:bg-neutral-800"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setRevealed(null)}
            className="text-xs text-neutral-500 mt-3 hover:text-black"
          >
            Done
          </button>
        </div>
      )}

      {error && <div className="text-xs text-black mb-3">{error}</div>}

      {keys.length === 0 && !creating && (
        <div className="p-6 rounded-xl border border-neutral-200 bg-white text-center text-xs text-neutral-500">
          No API keys yet.
        </div>
      )}

      <div className="space-y-2">
        {keys.map((k) => (
          <div
            key={k.id}
            className="p-4 rounded-xl border border-neutral-200 bg-white"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{k.name}</div>
                <div className="font-mono text-xs text-neutral-500 mt-1">
                  {k.prefix}
                </div>
              </div>
              <div className="flex gap-1 text-neutral-500">
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
                  className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-neutral-100"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Revoke"
                  onClick={() => remove(k.id)}
                  disabled={deletingId === k.id}
                  className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-neutral-100 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-neutral-500">
              <span>
                Last used{" "}
                <span className="text-black">
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
