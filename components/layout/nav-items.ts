import { Utensils, Droplets, Scale, BookMarked, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Diary", icon: Utensils, exact: true },
  { href: "/dashboard/water", label: "Water", icon: Droplets, exact: false },
  { href: "/dashboard/weight", label: "Weight", icon: Scale, exact: false },
  { href: "/dashboard/foods", label: "Foods", icon: BookMarked, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
] as const;
