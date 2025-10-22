// lib/supabase-server-user.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, anon, {
    cookies: {
      get: (k) => cookies().get(k)?.value,
      set: (k, v, o) => cookies().set({ name: k, value: v, ...o }),
      remove: (k, o) => cookies().set({ name: k, value: "", ...o, maxAge: 0 }),
    },
  });
}
