import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

// Shared shell for the Terms and Privacy pages.
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-paper)" }}>
      <header
        className="px-6 sm:px-10 lg:px-14 py-4 border-b"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" aria-label="Nudge home">
            <Wordmark size="sm" />
          </Link>
          <Link
            href="/"
            className="text-xs text-mute inline-flex items-center gap-1.5 hover:text-ink"
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-14 py-12">
        <h1
          className="font-display text-3xl sm:text-4xl leading-tight tracking-tight"
          style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <p className="text-xs text-mute mt-2 mb-8">Last updated {updated}</p>
        <div className="space-y-5 text-[15px] leading-relaxed text-ink/90">
          {children}
        </div>
      </main>
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-lg mt-6 mb-2" style={{ fontWeight: 700 }}>
        {heading}
      </h2>
      <div className="space-y-3 text-mute">{children}</div>
    </section>
  );
}
