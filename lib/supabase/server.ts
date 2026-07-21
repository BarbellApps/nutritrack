import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSigningKeys } from "./jwks";

export interface AuthedUser {
  id: string;
  email: string;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignored because proxy.ts
            // refreshes the session on every request instead.
          }
        },
      },
    }
  );
}

// Verifies the access token locally against the cached public JWKS — no
// network round trip (getUser() would cost a full trip to the US auth server
// on every call). cache() dedupes within one render pass so the layout and
// page share a single verification.
export const getCachedUser = cache(async (): Promise<AuthedUser | null> => {
  const supabase = await createClient();
  const keys = await getSigningKeys();
  const { data } = await supabase.auth.getClaims(undefined, keys ? { keys } : undefined);
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

// Shared auth gate for Server Actions: local JWT verification + the request's
// Supabase client. Throws when unauthenticated so callers can't proceed.
export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}> {
  const supabase = await createClient();
  const keys = await getSigningKeys();
  const { data } = await supabase.auth.getClaims(undefined, keys ? { keys } : undefined);
  const userId = data?.claims?.sub;
  if (!userId) throw new Error("Not authenticated");
  return { supabase, userId };
}
