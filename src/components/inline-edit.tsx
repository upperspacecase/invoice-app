"use client";

import { useState, useTransition } from "react";

export function InlineEdit({
  label,
  value,
  onSave,
  multiline = false,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<unknown>;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function commit() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onSave(draft);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="pb-3 border-b border-rule">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-xs text-mute">{label}</span>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="text-[11px] uppercase tracking-widest text-mute hover:text-ink transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              rows={2}
              className="flex-1 bg-transparent outline-none border-b border-ink/30 text-sm focus:border-ink resize-none"
            />
          ) : (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="flex-1 bg-transparent outline-none border-b border-ink/30 text-sm focus:border-ink"
            />
          )}
          <button
            type="button"
            onClick={commit}
            disabled={pending}
            className="text-xs px-2 py-1 rounded-md bg-ink text-paper hover:bg-ink/90 disabled:opacity-50"
          >
            {pending ? "…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={pending}
            className="text-xs px-2 py-1 text-mute hover:text-ink"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="text-sm break-words">{value}</div>
      )}
      {error && <div className="mt-1 text-[11px] text-accent">{error}</div>}
    </div>
  );
}
