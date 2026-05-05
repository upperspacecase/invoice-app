import { DemoProvider } from "@/components/demo-provider";
import { AppHeader } from "@/components/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 px-6 sm:px-10 lg:px-14 pb-20">
          <div className="max-w-2xl mx-auto">{children}</div>
        </main>
      </div>
    </DemoProvider>
  );
}
