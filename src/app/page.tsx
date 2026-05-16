import Link from "next/link";
import { Play } from "lucide-react";
import { HeroIllustration } from "@/components/landing/hero-illustration";
import { FeatureCards } from "@/components/landing/feature-cards";
import { SocialProof } from "@/components/landing/social-proof";
import { ClosingCTA } from "@/components/landing/closing-cta";
import { PricingBlock } from "@/components/pricing-block";
import { Wordmark } from "@/components/wordmark";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-cream)" }}
    >
      <Nav />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
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
    <header className="px-6 sm:px-10 lg:px-14 pt-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" aria-label="Nudge home">
          <Wordmark size="lg" />
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7 text-sm">
          <a href="#how-it-works" className="hidden sm:inline">
            How it works
          </a>
          <a href="#pricing" className="hidden sm:inline">
            Pricing
          </a>
          <Link href="/signin" className="hidden sm:inline">
            Log in
          </Link>
          <Link
            href="/signin"
            className="px-4 sm:px-5 h-10 inline-flex items-center justify-center rounded-full text-paper text-sm font-semibold"
            style={{ background: "var(--color-coral)" }}
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
    <section
      id="how-it-works"
      className="px-6 sm:px-10 lg:px-14 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-start">
        <div className="lg:pt-6">
          <h1
            className="font-serif tracking-tight leading-[1.02]"
            style={{
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Invoice once.<br />
            Stop{" "}
            <span className="relative inline-block">
              chasing
              <UnderlineDoodle />
            </span>
            .
          </h1>
          <p className="mt-6 text-base sm:text-lg text-mute max-w-md leading-relaxed">
            Send a clean invoice in seconds. Automatic reminders follow up
            until it&apos;s paid.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signin"
              className="px-6 h-12 inline-flex items-center justify-center rounded-full text-paper text-sm font-semibold transition-colors"
              style={{ background: "var(--color-coral)" }}
            >
              Start free
            </Link>
            <a
              href="#how-it-works"
              className="h-12 px-5 inline-flex items-center gap-2 rounded-full text-sm font-medium bg-white"
              style={{ border: "1.5px solid rgba(10,10,10,0.1)" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-paper"
                style={{ background: "var(--color-ink)" }}
                aria-hidden
              >
                <Play size={11} fill="currentColor" />
              </span>
              See how it works
            </a>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <ArrowDoodle />
            <span
              className="text-xs italic"
              style={{ color: "var(--color-coral-deep)" }}
            >
              No credit card required
            </span>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function UnderlineDoodle() {
  return (
    <svg
      aria-hidden
      width="100%"
      height="14"
      viewBox="0 0 240 14"
      preserveAspectRatio="none"
      className="absolute left-0 right-0"
      style={{ bottom: -6 }}
    >
      <path
        d="M 4 9 Q 60 1, 120 6 T 236 7"
        stroke="var(--color-coral)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ArrowDoodle() {
  return (
    <svg
      aria-hidden
      width="38"
      height="22"
      viewBox="0 0 38 22"
      style={{ color: "var(--color-coral-deep)" }}
    >
      <path
        d="M 4 18 Q 12 4, 30 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 26 3 L 32 6 L 28 11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Footer() {
  return (
    <footer
      className="px-6 sm:px-10 lg:px-14 py-8"
      style={{ borderTop: "1px solid rgba(10,10,10,0.08)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-mute">
        <Wordmark size="sm" />
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
