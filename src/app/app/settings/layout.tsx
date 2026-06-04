import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SettingsTabs } from "@/components/settings-tabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/app"
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1
          className="font-display text-3xl sm:text-4xl leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Settings
        </h1>
      </div>
      <SettingsTabs />
      <div className="pt-6">{children}</div>
    </div>
  );
}
