"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { updateBusinessAction } from "@/app/_actions";
import { initialBusiness } from "@/lib/demo-data";
import type { Business } from "@/lib/types";

const LABEL = "block font-mono text-[11px] uppercase tracking-widest text-mute mb-2";
const FIELD =
  "w-full px-4 border-[1.5px] border-rule bg-card outline-none focus:border-ink text-sm";

export function OnboardingForm({ initial }: { initial: Business }) {
  const router = useRouter();
  // Blank out the seed defaults so the user types their own.
  const [name, setName] = useState(
    initial.name === initialBusiness.name ? "" : initial.name
  );
  const [email, setEmail] = useState(
    initial.email === initialBusiness.email ? "" : initial.email
  );
  const [payment, setPayment] = useState(
    initial.payment === initialBusiness.payment ? "" : initial.payment
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateBusinessAction({
          name: name.trim() || initial.name,
          email: email.trim() || initial.email,
          payment: payment.trim() || initial.payment,
          onboarded: true,
        });
        router.replace("/app");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  function skip() {
    setError(null);
    startTransition(async () => {
      try {
        await updateBusinessAction({ onboarded: true });
        router.replace("/app");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not skip.");
      }
    });
  }

  return (
    <div className="pt-12 max-w-md mx-auto">
      <h1
        className="font-display text-4xl leading-tight tracking-tight"
        style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
      >
        Set your details once.
      </h1>
      <p className="text-sm text-mute mt-3 mb-8">
        Two minutes now saves you typing on every invoice. You can change these
        any time in Settings.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="biz-name" className={LABEL}>
            Business name
          </label>
          <input
            id="biz-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apex Electrical"
            autoFocus
            className={`${FIELD} h-11`}
          />
        </div>

        <div>
          <label htmlFor="biz-email" className={LABEL}>
            Email on invoices
          </label>
          <input
            id="biz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourtrade.co"
            className={`${FIELD} h-11`}
          />
        </div>

        <div>
          <label htmlFor="biz-payment" className={LABEL}>
            Payment details
          </label>
          <textarea
            id="biz-payment"
            rows={2}
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="e.g. Bank transfer — sort code 04-00-04 · acc 12345678"
            className={`${FIELD} py-3 resize-none`}
          />
        </div>

        {error && <div className="text-xs text-danger">{error}</div>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="h-11 px-6 bg-ink text-paper text-xs font-bold uppercase tracking-widest transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 inline-flex items-center gap-2"
            style={{ boxShadow: "4px 4px 0 var(--color-paid)" }}
          >
            {pending ? "Saving…" : "Continue"}
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={skip}
            disabled={pending}
            className="font-mono text-[11px] uppercase tracking-widest text-mute hover:text-ink underline underline-offset-4 disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
