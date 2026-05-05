"use client";

import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { useDemo } from "@/components/demo-provider";

export default function SettingsPage() {
  const { business, clients } = useDemo();

  return (
    <div className="pt-8">
      <div className="flex items-center gap-3 mb-10">
        <Link
          href="/app"
          aria-label="Back"
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-ink/5 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1
          className="font-serif text-3xl sm:text-4xl leading-tight"
          style={{ fontWeight: 400 }}
        >
          Settings
        </h1>
      </div>

      <section className="mb-12">
        <div className="text-xs uppercase tracking-widest text-mute mb-4">
          Your details — set once
        </div>
        <div className="space-y-4">
          <Field label="Business name" value={business.name} />
          <Field label="Email" value={business.email} />
          <Field label="Company" value={business.company} />
          <Field label="Payment details" value={business.payment} />
        </div>
      </section>

      <section>
        <div className="text-xs uppercase tracking-widest text-mute mb-4">
          Saved clients ({clients.length})
        </div>
        <ul className="space-y-2">
          {clients.map((c) => (
            <li
              key={c.id}
              className="p-3 rounded-xl bg-card border border-rule flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center">
                <User size={14} />
              </div>
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-mute">{c.email}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="pb-3 border-b border-rule">
      <div className="text-xs text-mute mb-1">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
