"use client";

import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Switch
      checked={resolvedTheme === "dark"}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      aria-label="Toggle dark mode"
    />
  );
}
