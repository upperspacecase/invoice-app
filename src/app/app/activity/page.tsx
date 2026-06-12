import Link from "next/link";
import { ArrowLeft, Bell, Bot, User } from "lucide-react";
import { requireOnboardedSession } from "@/lib/server/auth";
import { listActivity } from "@/lib/server/store";
import { relativeTime } from "@/lib/followup-cadence";
import type { ActivityActor } from "@/lib/types";

const TONE: Record<ActivityActor, string> = {
  agent: "var(--color-paid-deep)",
  you: "var(--color-ink)",
  system: "var(--color-mute)",
};

const BG: Record<ActivityActor, string> = {
  agent: "rgba(46,184,106,0.12)",
  you: "rgba(28,31,26,0.05)",
  system: "rgba(28,31,26,0.05)",
};

const ACTOR_LABEL: Record<ActivityActor, string> = {
  agent: "Nudge",
  you: "You",
  system: "System",
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
          className="font-display text-2xl sm:text-3xl leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Activity
        </h1>
      </div>
      <p className="text-sm text-mute mb-6">
        Everything Nudge has done for you — and everything you&apos;ve done.
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
                    {ACTOR_LABEL[e.who]}
                  </span>
                  <span className="text-[11px] text-mute">
                    {relativeTime(e.at)}
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
