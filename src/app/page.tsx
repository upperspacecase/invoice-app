import Link from "next/link";
import { Play, User, Users, FileText } from "lucide-react";
import { HeroCard } from "@/components/hero-card";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Pricing />
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
          <Link href="/signin" className="text-sm hidden sm:inline">
            Sign in
          </Link>
          <Link
            href="/signin"
            className="text-sm bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink/90 transition-colors"
          >
            Try it
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
            Send an<br />
            invoice in<br />
            three taps.
          </h1>
          <p className="mt-6 text-lg text-mute max-w-md">
            Pick client. Confirm amount. Send.<br />
            No accounting bloat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signin"
              className="bg-ink text-paper px-7 py-3 rounded-md text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              Try it
            </Link>
            <a
              href="#how-it-works"
              className="border border-rule px-7 py-3 rounded-md text-sm font-medium flex items-center gap-2 hover:border-ink/40 transition-colors"
            >
              <Play size={14} />
              See how it works
            </a>
          </div>
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
      title: "Auto-send PDF invoices",
      body: "We generate and email the invoice instantly.",
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

function Pricing() {
  return (
    <section
      id="pricing"
      className="px-6 sm:px-10 lg:px-14 py-20 sm:py-24 border-t border-rule"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
        <h2
          className="font-serif text-4xl sm:text-5xl leading-[1.05]"
          style={{ fontWeight: 400 }}
        >
          Pricing
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <PricingCard
            name="Free"
            price="$0"
            cadence="forever"
            features={[
              "3 invoices per month",
              "PDF + email delivery",
              "1 saved client",
            ]}
            cta="Start free"
          />
          <PricingCard
            name="Pro"
            price="$8"
            cadence="per month"
            features={[
              "Unlimited invoices",
              "Unlimited saved clients",
              "Stripe payment links",
            ]}
            cta="Start Pro"
            highlighted
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  cadence,
  features,
  cta,
  highlighted = false,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col ${
        highlighted
          ? "bg-ink text-paper border-ink"
          : "bg-card border-rule text-ink"
      }`}
    >
      <div className="text-sm font-medium">{name}</div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-4xl">{price}</span>
        <span
          className={`text-xs ${highlighted ? "text-paper/60" : "text-mute"}`}
        >
          {cadence}
        </span>
      </div>
      <ul className="mt-6 space-y-2 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className={`text-sm ${highlighted ? "text-paper/80" : "text-ink/80"}`}
          >
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/signin"
        className={`mt-6 text-sm font-medium px-4 py-2.5 rounded-md text-center transition-colors ${
          highlighted
            ? "bg-paper text-ink hover:bg-paper/90"
            : "bg-ink text-paper hover:bg-ink/90"
        }`}
      >
        {cta}
      </Link>
    </div>
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
