"use client";

import { useState, useTransition } from "react";
import { updateBusinessAction } from "@/app/_actions";

const PRESETS = [
  "#0a0a0a",
  "#c44e2c",
  "#2d7a4f",
  "#1f5fa0",
  "#7b2da7",
  "#b8860b",
];

export function BrandColorPicker({
  current,
  disabled = false,
}: {
  current?: string;
  disabled?: boolean;
}) {
  const [color, setColor] = useState(current ?? "#0a0a0a");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save(c: string) {
    setColor(c);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateBusinessAction({ brandColor: c });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-rule p-4 bg-card">
      <div className="text-sm font-medium mb-1">Brand color</div>
      <div className="text-xs text-mute mb-3">
        Used on the accent bar at the top of every PDF and the pay-link
        button.
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled || pending}
            onClick={() => save(p)}
            aria-label={`Brand color ${p}`}
            className="w-7 h-7 rounded-full transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: p,
              boxShadow:
                color === p
                  ? `0 0 0 2px var(--color-paper), 0 0 0 4px ${p}`
                  : "none",
            }}
          />
        ))}
        <label
          className="ml-1 inline-flex items-center gap-2 text-xs text-mute cursor-pointer"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          <input
            type="color"
            value={color}
            disabled={disabled || pending}
            onChange={(e) => save(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
          />
          Custom
        </label>
        {saved && !pending && (
          <span className="text-xs text-[var(--color-paid)] ml-2">
            Saved
          </span>
        )}
      </div>
      {error && (
        <div className="text-xs text-accent mt-2">{error}</div>
      )}
    </div>
  );
}
