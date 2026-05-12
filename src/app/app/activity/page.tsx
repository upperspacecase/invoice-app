import Link from "next/link";
import { ArrowLeft, Bell, Bot, User } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";
import { listActivity } from "@/lib/server/store";
import type { ActivityActor } from "@/lib/types";

const TONE: Record<ActivityActor, string> = {
  agent: "var(--color-accent)",
  you: "var(--color-ink)",
  system: "var(--color-mute)",
};

const BG: Record<ActivityActor, string> = {
  agent: "rgba(196,78,44,0.1)",
  you: "rgba(10,10,10,0.05)",
  system: "rgba(10,10,10,0.05)",
};

export default async function ActivityPage() {
  const { uid } = await requireOnboardedSession();
  const events = await listActivity(uid, 60);

  return (
    <div className="pt-8">
      <div className="flex items-center gap-3 mb-3">
        <Link
          href="/app"
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1
          className="font-serif text-2xl sm:text-3xl leading-tight"
          style={{ fontWeight: 400 }}
        >
          Activity
        </h1>
      </div>
      <p className="text-sm text-mute mb-6">
        Everything you and your agents have done.
      </p>

      <ul>
        {events.map((e) => {
          const Icon = e.who === "agent" ? Bot : e.who === "you" ? User : Bell;
          return (
            <li
              key={e.id}
              className="flex gap-3 py-3.5 border-b border-rule last:border-b-0"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: BG[e.who], color: TONE[e.who] }}
                aria-hidden
              >
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span
                    className="text-[11px] uppercase tracking-widest font-medium"
                    style={{ color: TONE[e.who] }}
                  >
                    {e.who}
                  </span>
                  <span className="text-[11px] text-mute">
                    {relative(e.at)}
                  </span>
                </div>
                <div className="text-sm mt-1">{e.text}</div>
                {e.meta && (
                  <div className="text-xs text-mute mt-0.5 font-mono">
                    {e.meta}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function relative(at: number): string {
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  return new Date(at).toLocaleDateString();
}
