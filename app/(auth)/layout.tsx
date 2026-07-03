import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        NutriTrack
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
