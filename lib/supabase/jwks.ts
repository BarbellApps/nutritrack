// The project signs JWTs with an asymmetric key (ES256), so access tokens can
// be verified locally with the public JWKS instead of a network round trip to
// the auth server on every request (getUser() costs ~350ms from EU → the US
// Supabase region; local verification is ~8ms).
//
// A fresh @supabase/ssr client is created per request, so its built-in JWKS
// cache never survives. We cache the public keys at module scope (shared
// across requests in a warm server instance) and hand them to getClaims().

import type { JWK } from "@supabase/auth-js";

interface Jwks {
  keys: JWK[];
}

let cachedKeys: JWK[] | undefined;
let fetchedAt = 0;
const TTL_MS = 10 * 60 * 1000; // JWKS rotate rarely; 10 min keeps us fresh enough.

export async function getSigningKeys(): Promise<JWK[] | undefined> {
  const now = Date.now();
  if (cachedKeys && now - fetchedAt < TTL_MS) return cachedKeys;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as Jwks;
      if (Array.isArray(data.keys) && data.keys.length > 0) {
        cachedKeys = data.keys;
        fetchedAt = now;
      }
    }
  } catch {
    // Network hiccup — keep serving the last-known keys. If we never fetched
    // any, getClaims() falls back to its own fetch (still correct, just slower).
  }

  return cachedKeys;
}
