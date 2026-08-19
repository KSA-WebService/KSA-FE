import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Confirms a Supabase session is present and valid, refreshing it first if
// the access token is about to expire. This is NOT proof of KSA admin
// authorization -- it only proves the request carries a genuine, currently
// valid Supabase identity. Admin authorization is verified separately, by
// the protected layout (src/app/admin/(protected)/layout.tsx) calling
// GET /api/v1/admin/me.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getClaims() verifies the JWT (locally against the project's JWKS when
  // possible, avoiding a network round-trip) and refreshes the session
  // first if the access token is about to expire. This IS the
  // "verify/refresh Supabase authentication" step -- it is deliberately not
  // used anywhere as an admin-authorization decision.
  const { data, error } = await supabase.auth.getClaims();
  const hasValidSession = Boolean(data?.claims) && !error;

  const { pathname } = request.nextUrl;
  const isProtectedAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedAdminRoute && !hasValidSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
