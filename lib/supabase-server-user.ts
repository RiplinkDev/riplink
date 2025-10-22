// /lib/supabase-server-user.ts
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * User-scoped Supabase client for Server Components / API routes.
 * Uses the public anon key + the user's auth cookies so RLS can do its job.
 */
export function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Basic guard so we fail loudly in dev if env vars are missing
  if (!supabaseUrl || !supabaseAnon) {
    throw new Error(
      "[supabase-server-user] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Pass Next.js cookies through to Supabase so sessions work server-side
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // Next 15 cookies() is mutable on the server
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", expires: new Date(0), ...options });
      },
    },
    // Optional: forward selected request headers if you ever need them
    // headers: { get: (n: string) => headers().get(n) ?? undefined },
  });
}
