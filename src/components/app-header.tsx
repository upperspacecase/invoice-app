"use client";

import Link from "next/link";
import { Settings, LogOut } from "lucide-react";

export function AppHeader() {
  return (
    <header className="px-6 sm:px-10 lg:px-14 py-5 border-b border-rule">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link
          href="/app"
          className="text-sm font-mono tracking-tight text-ink"
        >
          invoice-app
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/app/settings"
            aria-label="Settings"
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
          >
            <Settings size={16} />
          </Link>
          <Link
            href="/"
            aria-label="Sign out"
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
