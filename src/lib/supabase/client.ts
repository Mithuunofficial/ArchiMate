import { createClient } from "@supabase/supabase-js";

const getNormalizedUrl = (rawUrl?: string): string => {
  if (!rawUrl) return "https://placeholder-project.supabase.co";
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  return trimmed || "https://placeholder-project.supabase.co";
};

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = getNormalizedUrl(rawUrl);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key").trim();

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return (
    !!url &&
    !url.includes("placeholder-project") &&
    !url.includes("your-project-ref") &&
    !url.includes("YOUR_SUPABASE_URL") &&
    !!key &&
    key !== "placeholder-anon-key" &&
    !key.includes("your-supabase-anon-key") &&
    !key.includes("placeholder")
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
      } catch {
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
            message: "Authentication service is temporarily unavailable. Please try again later.",
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

