"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { QuickScanDialog } from "@/components/diary/QuickScanDialog";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] shadow-soft md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}

      <QuickScanDialog />
    </nav>
  );
}
