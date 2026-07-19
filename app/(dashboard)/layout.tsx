import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-1">
      <Sidebar userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
