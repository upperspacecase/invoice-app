import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 lg:px-14 pt-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="text-sm font-mono tracking-tight text-ink"
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
          <p className="text-sm text-mute mb-8">
            We&apos;ll email you a link. No password.
          </p>

          <form action="/app" className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest text-mute mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@studio.co"
                className="w-full h-12 px-4 rounded-md border border-rule bg-card outline-none focus:border-ink/40"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-md bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              Continue
            </button>
          </form>

          <p className="text-xs text-mute mt-8 text-center">
            <Link href="/" className="underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
