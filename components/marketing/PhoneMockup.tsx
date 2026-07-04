import { ChevronLeft, ChevronRight, Coffee, Sandwich, Plus, Utensils, Droplets, Scale, BookMarked, Settings } from "lucide-react";

const RINGS = [
  { label: "Calories", value: 1450, goal: 2000, colorVar: "--chart-1", radius: 30 },
  { label: "Protein", value: 92, goal: 120, colorVar: "--chart-2", radius: 23 },
  { label: "Carbs", value: 140, goal: 225, colorVar: "--chart-3", radius: 16 },
];

const STATS = [
  { label: "Calories", value: "550", unit: "left", pct: 73, colorVar: "--chart-1" },
  { label: "Protein", value: "92", unit: "g", pct: 77, colorVar: "--chart-2" },
  { label: "Carbs", value: "140", unit: "g", pct: 62, colorVar: "--chart-3" },
  { label: "Fat", value: "38", unit: "g", pct: 58, colorVar: "--chart-4" },
];

function Ring({ value, goal, colorVar, radius }: (typeof RINGS)[number]) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <g>
      <circle cx={36} cy={36} r={radius} fill="none" stroke="var(--muted)" strokeWidth={6} />
      <circle
        cx={36}
        cy={36}
        r={radius}
        fill="none"
        stroke={`var(${colorVar})`}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct / 100)}
      />
    </g>
  );
}

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[290px] shrink-0 select-none">
      <div className="relative rounded-[2.75rem] border-[6px] border-neutral-800 bg-black p-2 shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <div className="absolute top-2 left-1/2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
        <div className="relative flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2.25rem] bg-background px-4 pt-9 pb-3">
          <div className="flex items-center justify-between text-foreground">
            <ChevronLeft className="size-4" />
            <span className="text-sm font-bold tracking-tight">Today</span>
            <ChevronRight className="size-4" />
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-card px-3 py-3">
            <svg viewBox="0 0 72 72" width={60} height={60} className="-rotate-90 shrink-0">
              {RINGS.map((r) => (
                <Ring key={r.label} {...r} />
              ))}
            </svg>
            <div className="flex flex-1 flex-col gap-1">
              {RINGS.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-[8px] font-medium">
                  <span className="flex items-center gap-1 text-foreground">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(${r.colorVar})` }}
                    />
                    {r.label}
                  </span>
                  <span className="text-muted-foreground">
                    {r.value}/{r.goal}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 rounded-xl bg-card px-2.5 py-2">
                <span className="text-[7px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {s.label}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-bold tracking-tight text-foreground">{s.value}</span>
                  <span className="text-[8px] font-medium text-muted-foreground">{s.unit}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.pct}%`, backgroundColor: `var(${s.colorVar})` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 rounded-xl bg-card px-2.5 py-2">
              <span className="flex size-2 items-center justify-center rounded-full bg-cyan-500/20 p-2 text-cyan-300">
                <Droplets className="size-2.5" />
              </span>
              <div className="flex flex-1 items-center justify-between">
                <span className="text-[9px] font-semibold text-foreground">Water</span>
                <span className="text-[8px] text-muted-foreground">1.2L / 2.0L</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-card px-2.5 py-2">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-lg bg-accent text-primary">
                  <Coffee className="size-2.5" />
                </span>
                <span className="text-[9px] font-semibold text-foreground">Breakfast</span>
                <span className="ml-auto text-[8px] font-medium text-primary">410 kcal</span>
              </div>
              <div className="ml-7 flex items-center justify-between text-[8px] text-muted-foreground">
                <span>Greek yogurt &amp; berries</span>
                <span>210 kcal</span>
              </div>
              <div className="ml-7 flex items-center justify-between text-[8px] text-muted-foreground">
                <span>Granola</span>
                <span>200 kcal</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-card px-2.5 py-2">
              <span className="flex size-5 items-center justify-center rounded-lg bg-accent text-primary">
                <Sandwich className="size-2.5" />
              </span>
              <span className="text-[9px] font-semibold text-foreground">Lunch</span>
              <span className="ml-auto text-[8px] font-medium text-primary">640 kcal</span>
            </div>
          </div>

          <div className="relative mt-auto flex items-center justify-around rounded-full border border-white/10 bg-[#1c1c1ef2] px-1 py-1.5 shadow-lg shadow-black/40">
            <Utensils className="size-3 rounded-full bg-white/10 p-0.5 text-primary" />
            <Droplets className="size-3 text-muted-foreground" />
            <span className="absolute left-1/2 -top-4 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Plus className="size-4" />
            </span>
            <Scale className="size-3 text-muted-foreground" />
            <BookMarked className="size-3 text-muted-foreground" />
            <Settings className="size-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
