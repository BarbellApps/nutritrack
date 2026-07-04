"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { QuickScanDialog } from "@/components/diary/QuickScanDialog";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed inset-x-3 z-40 md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <nav className="glass-nav relative flex items-center rounded-full border border-white/10 bg-[#1c1c1ef2] px-1 py-1.5 shadow-lg shadow-black/40">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-medium transition-colors",
                active ? "bg-white/10 text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}

        <QuickScanDialog />
      </nav>
    </div>
  );
}
