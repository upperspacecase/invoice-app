import { AppHeader } from "@/components/app-header";

// In-memory store mutates at runtime, so /app must always render fresh.
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-6 sm:px-10 lg:px-14 pb-20">
        <div className="max-w-2xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
