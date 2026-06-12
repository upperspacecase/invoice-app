import Link from "next/link";
import Image from "next/image";
import { HeroIllustration } from "@/components/landing/hero-illustration";
import { SocialProof } from "@/components/landing/social-proof";
import { ClosingCTA } from "@/components/landing/closing-cta";
import { PricingBlock } from "@/components/pricing-block";
import { Wordmark } from "@/components/wordmark";

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
                boxShadow: "4px 4px 0 var(--color-ink)",
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
      <div className="max-w-3xl mx-auto">
        <Image
          src="/brand/meet-nudge.png"
          alt="Meet Nudge. He keeps the admin moving so you can keep doing what you do best."
          width={666}
          height={412}
          className="w-full h-auto"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 sm:px-10 lg:px-14 pb-16 sm:pb-20"
    >
      <div className="max-w-3xl mx-auto">
        <Image
          src="/brand/how-it-works.png"
          alt="You do the job. Nudge does the follow-up. 1 — You send the invoice. 2 — Nudge sends friendly reminders and keeps track. 3 — You get paid. Nudge says thanks."
          width={660}
          height={422}
          className="w-full h-auto"
          sizes="(max-width: 768px) 100vw, 768px"
        />
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
        <span>© {new Date().getFullYear()} — Free to send · 1% when you&apos;re paid</span>
      </div>
    </footer>
  );
}
