import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Apple, Barcode, Droplets, LineChart } from "lucide-react";

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
    icon: Droplets,
    title: "Track water & weight",
    body: "Quick-add water intake and log your weight to see trends over time.",
  },
  {
    icon: LineChart,
    title: "See your progress",
    body: "Daily calorie and macro breakdowns, plus charts for weight and water history.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">NutriTrack</span>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-12">
        <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Track calories &amp; nutrition, without the friction.
          </h1>
          <p className="text-lg text-muted-foreground">
            Log food, scan barcodes, track water and weight, and see exactly
            where your day stands — all free to start.
          </p>
          <div className="flex gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Start tracking free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="flex gap-4 pt-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} NutriTrack
      </footer>
    </div>
  );
}
