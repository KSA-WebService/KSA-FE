import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server Supabase client for use in Server Components, Route Handlers, and
// Server Actions. Auth only -- never call .from(...) here; all KSA
// application data goes through the NestJS API (see lib/api).
//
// getSession()'s user object must never be treated as proof of KSA admin
// authorization on its own -- only GET /api/v1/admin/me (lib/api/admin.ts)
// is. Reading the session here is for obtaining the raw access token to
// forward as a Bearer header.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render, where cookies can't be
            // mutated. The proxy (src/proxy.ts) already refreshes the
            // session on every request, so this is safe to ignore here.
          }
        },
      },
    },
  );
}
