"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "account", label: "Account", href: "/app/settings/account" },
  { id: "billing", label: "Billing", href: "/app/settings/billing" },
  { id: "developers", label: "Developers", href: "/app/settings/developers" },
  { id: "automations", label: "Automations", href: "/app/settings/automations" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-rule overflow-x-auto -mx-1 px-1">
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.id}
            href={t.href}
            className="px-3.5 py-2.5 text-sm whitespace-nowrap -mb-px"
            style={{
              borderBottom: active
                ? "2px solid var(--color-ink)"
                : "2px solid transparent",
              color: active
                ? "var(--color-ink)"
                : "var(--color-mute)",
              fontWeight: active ? 500 : 400,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
