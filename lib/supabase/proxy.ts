import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSigningKeys } from "./jwks";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PREFIXES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verify the session locally against the cached public JWKS instead of a
  // round trip to the US auth server on every navigation. getClaims() still
  // reads (and refreshes, when expired) the session cookie, so the refreshed
  // cookies are written to `response` exactly as before.
  const keys = await getSigningKeys();
  const { data } = await supabase.auth.getClaims(undefined, keys ? { keys } : undefined);
  const isAuthed = !!data?.claims?.sub;

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
