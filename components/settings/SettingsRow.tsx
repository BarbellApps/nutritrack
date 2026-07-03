import type { ReactNode } from "react";

export function SettingsRow({
  icon,
  label,
  colorVar,
  children,
}: {
  icon: ReactNode;
  label: string;
  colorVar: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `color-mix(in oklch, var(${colorVar}) 18%, transparent)`, color: `var(${colorVar})` }}
      >
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
