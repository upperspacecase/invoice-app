import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 lg:px-14 pt-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="text-sm font-mono tracking-tight text-black"
          >
            invoice-app
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1
            className="font-serif text-4xl mb-2 leading-tight"
            style={{ fontWeight: 400 }}
          >
            Sign in
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            We&apos;ll email you a link. No password.
          </p>
          <Suspense
            fallback={<div className="text-sm text-neutral-500">Loading…</div>}
          >
            <SignInForm />
          </Suspense>
          <p className="text-xs text-neutral-500 mt-8 text-center">
            <Link href="/" className="underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
