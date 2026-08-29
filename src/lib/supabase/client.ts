import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    url !== "https://placeholder-project.supabase.co" &&
    !url.includes("your-project-ref") &&
    !!key &&
    key !== "placeholder-anon-key" &&
    !key.includes("your-supabase-anon-key")
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (url, options) => {
      try {
        const res = await fetch(url, options);
        return res;
      } catch (err: any) {
        // Intercept network/DNS failures (e.g. ERR_NAME_NOT_RESOLVED)
        // to prevent GoTrueClient from retrying infinitely in the browser
        if (typeof window !== "undefined") {
          // Clear stale auth storage tokens if host is unresolvable
          try {
            Object.keys(localStorage).forEach((k) => {
              if (k.startsWith("sb-") || k.includes("supabase")) {
                localStorage.removeItem(k);
              }
            });
          } catch {}
        }
        return new Response(
          JSON.stringify({
            error: "network_error",
            message: "Supabase endpoint unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL.",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },
  },
});
