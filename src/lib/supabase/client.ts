import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client. Auth only -- never call .from(...) here or
// anywhere else; the Data API is disabled for this project and all KSA
// application data goes through the NestJS API (see lib/api).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

// Current Supabase access token for client components calling the NestJS
// API directly (dashboard counts, Users list/detail, ...). This reads the
// token through the official client API, not a manually-managed store --
// the token itself still lives only in the cookies @supabase/ssr manages.
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
