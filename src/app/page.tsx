import Link from "next/link";
import Image from "next/image";
import { HeroIllustration } from "@/components/landing/hero-illustration";
import { SocialProof } from "@/components/landing/social-proof";
import { ClosingCTA } from "@/components/landing/closing-cta";
import { PricingBlock } from "@/components/pricing-block";
import { Wordmark } from "@/components/wordmark";

// Re-render daily so the hero card's computed chase dates stay current.
export const revalidate = 86400;

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-paper)" }}
    >
      <Nav />
      <main className="flex-1">
        <Hero />
        <MeetNudge />
        <HowItWorks />
        <SocialProof />
        <PricingBlock />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header
      className="px-6 sm:px-10 lg:px-14 py-4 border-b-[1.5px]"
      style={{ borderColor: "var(--color-ink)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" aria-label="Nudge home">
          <Wordmark size="lg" />
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7 font-mono text-[11px] uppercase tracking-widest">
          <a href="#how-it-works" className="hidden sm:inline hover:text-paid-deep">
            How it works
          </a>
          <a href="#pricing" className="hidden sm:inline hover:text-paid-deep">
            Pricing
          </a>
          <Link href="/signin" className="hidden sm:inline hover:text-paid-deep">
            Log in
          </Link>
          <Link
            href="/signin"
            className="px-5 h-9 inline-flex items-center justify-center text-paper text-[11px] font-bold uppercase tracking-widest"
            style={{ background: "var(--color-ink)" }}
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pt-14 sm:pt-20 pb-16 sm:pb-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute mb-6 flex items-center gap-2.5">
            <span
              className="inline-block w-2.5 h-2.5"
              style={{ background: "var(--color-paid)" }}
              aria-hidden
            />
            Free to send · 1% when you&apos;re paid
          </div>
          <h1
            className="font-display tracking-tight leading-[0.98]"
            style={{
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              letterSpacing: "-0.025em",
            }}
          >
            Send the invoice. Forget about it.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-mute max-w-md leading-relaxed">
            Nudge is your invoicing assistant. It sends the invoice, knows when
            it&apos;s due, reminds your client at the right moments — politely,
            then firmly — until the money lands in your bank.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-8 text-paper text-sm font-bold uppercase tracking-widest transition-transform active:translate-x-[3px] active:translate-y-[3px]"
              style={{
                height: 54,
                background: "var(--color-paid)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              Start free
            </Link>
            <a
              href="#how-it-works"
              className="font-mono text-[11px] uppercase tracking-widest underline underline-offset-4 hover:text-paid-deep"
            >
              See how it works
            </a>
          </div>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-mute">
            No card required · no monthly fee · Nudge only earns when you do
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function MeetNudge() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-12 sm:pb-16">
      <div
        className="max-w-3xl mx-auto rounded-2xl border border-rule bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
        style={{ boxShadow: "var(--shadow-soft-sm)" }}
      >
        <Image
          src="/brand/nudge-goblin.png"
          alt="Nudge, the invoicing assistant"
          width={132}
          height={132}
          className="rounded-2xl flex-shrink-0"
        />
        <div>
          <h2
            className="font-display text-2xl sm:text-3xl leading-tight tracking-tight"
            style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Meet Nudge.
          </h2>
          <p className="text-sm sm:text-base text-mute mt-2 leading-relaxed max-w-md">
            He keeps the admin moving so you can keep doing what you do best.
          </p>
          <div
            className="inline-block mt-4 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-widest"
            style={{ background: "var(--color-hivis)", color: "var(--color-ink)" }}
          >
            Jobs done. Payments follow.
          </div>
        </div>
      </div>
    </section>
  );
}

const HOW_STEPS = [
  { n: 1, text: "You send the invoice." },
  { n: 2, text: "Nudge sends friendly reminders and keeps track." },
  { n: 3, text: "You get paid. Nudge says thanks." },
] as const;

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 sm:px-10 lg:px-14 pb-16 sm:pb-20"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2
          className="font-display leading-tight tracking-tight"
          style={{
            fontWeight: 800,
            fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)",
            letterSpacing: "-0.02em",
          }}
        >
          You do the job.{" "}
          <span style={{ color: "var(--color-paid-deep)" }}>Nudge</span> does
          the follow-up.
        </h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-6 sm:gap-4 text-left">
          {HOW_STEPS.map((s) => (
            <div key={s.n} className="flex sm:flex-col items-start gap-3">
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-paper font-display flex-shrink-0"
                style={{ background: "var(--color-paid)", fontWeight: 700 }}
                aria-hidden
              >
                {s.n}
              </span>
              <p className="text-sm sm:text-base leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="px-6 sm:px-10 lg:px-14 py-6 border-t-[1.5px]"
      style={{ borderColor: "var(--color-ink)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest text-mute">
        <Wordmark size="sm" />
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-paid-deep">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-paid-deep">
            Privacy
          </Link>
          <span>© {new Date().getFullYear()} — Free to send · 1% when you&apos;re paid</span>
        </div>
      </div>
    </footer>
  );
}
