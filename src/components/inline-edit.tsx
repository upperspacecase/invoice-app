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
    <div className="pb-3 border-b border-neutral-200">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-xs text-neutral-500">{label}</span>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
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
              className="flex-1 bg-transparent outline-none border-b border-neutral-300 text-sm focus:border-black resize-none"
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
              className="flex-1 bg-transparent outline-none border-b border-neutral-300 text-sm focus:border-black"
            />
          )}
          <button
            type="button"
            onClick={commit}
            disabled={pending}
            className="text-xs px-2 py-1 rounded-md bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? "…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={pending}
            className="text-xs px-2 py-1 text-neutral-500 hover:text-black"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="text-sm break-words">{value}</div>
      )}
      {error && <div className="mt-1 text-[11px] text-black">{error}</div>}
    </div>
  );
}
