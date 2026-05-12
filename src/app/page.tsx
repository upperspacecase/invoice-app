import Link from "next/link";
import { Play, User, Users, FileText } from "lucide-react";
import { HeroCard } from "@/components/hero-card";
import { PricingBlock } from "@/components/pricing-block";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <PricingBlock />
        <CloseCTA />
      </main>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="px-6 sm:px-10 lg:px-14 pt-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-mono tracking-tight text-ink"
        >
          invoice-app
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <a href="#how-it-works" className="text-sm hidden sm:inline">
            How it works
          </a>
          <a href="#pricing" className="text-sm hidden sm:inline">
            Pricing
          </a>
          <Link href="/signin" className="text-sm hidden sm:inline">
            Sign in
          </Link>
          <Link
            href="/signin"
            className="text-sm bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink/90 transition-colors"
          >
            Send your first invoice — free
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pt-16 sm:pt-20 pb-20 sm:pb-28">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight"
            style={{ fontWeight: 400 }}
          >
            Get paid before<br />
            the meeting ends.
          </h1>
          <p className="mt-6 text-lg text-mute max-w-md">
            Invoice from your phone, on the call, in under 60 seconds. Your
            client clicks a payment link from their inbox before they&apos;ve
            stood up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signin"
              className="bg-ink text-paper px-7 py-3 rounded-md text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              Send your first invoice — free
            </Link>
            <a
              href="#how-it-works"
              className="border border-rule px-7 py-3 rounded-md text-sm font-medium flex items-center gap-2 hover:border-ink/40 transition-colors"
            >
              <Play size={14} />
              See it on your phone
            </a>
          </div>
          <p className="mt-4 text-xs text-mute">
            No card required for Send. Cancel anytime.
          </p>
        </div>

        <div className="lg:justify-self-end w-full max-w-md mx-auto lg:mx-0">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const items = [
    {
      icon: User,
      title: "Set your details once",
      body: "Add your business info and payment details.",
    },
    {
      icon: Users,
      title: "Save clients as you go",
      body: "Create a client once. Use them forever.",
    },
    {
      icon: FileText,
      title: "Send PDF invoices in three taps",
      body: "Pick client, confirm amount, send. Stripe link in the email.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="px-6 sm:px-10 lg:px-14 py-20 sm:py-24 border-t border-rule"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
        <h2
          className="font-serif text-4xl sm:text-5xl leading-[1.05]"
          style={{ fontWeight: 400 }}
        >
          What it does
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <div className="w-10 h-10 rounded-full border border-rule flex items-center justify-center mb-5">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div className="text-sm font-medium mb-2">{title}</div>
              <div className="text-sm text-mute leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CloseCTA() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 py-20 sm:py-24 border-t border-rule">
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="font-serif text-3xl sm:text-4xl leading-tight"
          style={{ fontWeight: 400 }}
        >
          Stop chasing payments. Start receiving them.
        </h2>
        <p className="text-sm text-mute mt-4 max-w-md mx-auto">
          If your client doesn&apos;t open the invoice within 24 hours, the
          next month of Pro is on us.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signin"
            className="bg-ink text-paper px-7 py-3 rounded-md text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            Send your first invoice — free
          </Link>
        </div>
        <p className="mt-4 text-xs text-mute">
          No card required for Send. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 sm:px-10 lg:px-14 py-10 border-t border-rule">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-mute">
        <span className="font-mono">invoice-app</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
