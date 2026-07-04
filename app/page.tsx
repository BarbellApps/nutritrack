import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { Apple, Barcode, Camera, Droplets, LineChart, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Apple,
    title: "Log meals in seconds",
    body: "Search a huge food database, save your own custom foods, and log breakfast, lunch, dinner, and snacks with a tap.",
  },
  {
    icon: Barcode,
    title: "Scan barcodes",
    body: "Point your camera at any packaged product to pull in accurate nutrition facts instantly.",
  },
  {
    icon: Camera,
    title: "AI photo scan",
    body: "Snap a photo of your plate — Claude breaks it into individual ingredients and estimates the nutrition for each.",
  },
  {
    icon: Droplets,
    title: "Track water & weight",
    body: "Quick-add water intake and log your weight to see trends over time.",
  },
  {
    icon: LineChart,
    title: "See your progress",
    body: "Daily calorie and macro breakdowns, plus charts for weight and water history.",
  },
  {
    icon: Sparkles,
    title: "Full food detail",
    body: "Tap any food to see its real product photo, brand, full macros, and ingredients list.",
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-10%] left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[15%] right-[-15%] h-[420px] w-[420px] rounded-full bg-[color:var(--chart-3)]/10 blur-[120px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight">NutriTrack</span>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-28 px-6 py-12">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              AI-powered food recognition
            </span>
            <h1 className="text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Track calories &amp; nutrition,
              <br />
              without the <span className="text-primary">friction</span>.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Log food, scan barcodes, snap a photo of your plate, and see
              exactly where your day stands — all free to start.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 px-6 text-base" asChild>
                <Link href="/signup">Start tracking free</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Free to start · No credit card required
            </p>
          </div>

          <PhoneMockup />
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-muted-foreground">
              Five ways to log a meal, one clear picture of your day.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-card px-6 py-14 text-center">
          <h2 className="max-w-lg text-3xl font-bold tracking-tight">
            Start seeing your nutrition clearly, today.
          </h2>
          <p className="max-w-md text-muted-foreground">
            Free to start. No credit card required.
          </p>
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/signup">Start tracking free</Link>
          </Button>
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} NutriTrack
      </footer>
    </div>
  );
}
