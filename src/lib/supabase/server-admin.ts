import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const getNormalizedUrl = (rawUrl?: string): string => {
  if (!rawUrl) return "https://placeholder-project.supabase.co";
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  return trimmed || "https://placeholder-project.supabase.co";
};

const supabaseUrl = getNormalizedUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

// Check SUPABASE_SERVICE_ROLE_KEY or fall back to ANON key
const serviceRoleKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-key"
).trim();

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: async (url, options) => {
      try {
        const res = await fetch(url, options);
        return res;
      } catch {
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

/**
 * Verify request authentication and admin role server-side
 */
export async function verifyAdminSession(req: NextRequest): Promise<{
  authorized: boolean;
  userId: string | null;
  adminUsername: string | null;
  error: string | null;
}> {
  try {
    const authHeader = req.headers.get("authorization");
    let token = authHeader ? authHeader.replace("Bearer ", "").trim() : null;

    // Check cookie fallback if no Authorization header
    if (!token) {
      token = req.cookies.get("archimate_admin_token")?.value || null;
    }

    if (!token) {
      return {
        authorized: false,
        userId: null,
        adminUsername: null,
        error: "Unauthorized: Missing authentication token",
      };
    }

    // Handle custom admin session tokens directly
    if (token.startsWith("admin-session-")) {
      return {
        authorized: true,
        userId: "268b5fe1-46cf-4e16-8b8f-8cd1ac6c17f6",
        adminUsername: process.env.ADMIN_USERNAME || "Admin-Archimate",
        error: null,
      };
    }

    // Verify token with Supabase Auth for standard JWT tokens
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return {
        authorized: false,
        userId: null,
        adminUsername: null,
        error: "Unauthorized: Invalid token session",
      };
    }

    const user = data.user;

    // Verify role in profiles table
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, username, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.status === "suspended") {
      return {
        authorized: false,
        userId: user.id,
        adminUsername: profile.username,
        error: "Forbidden: Account suspended",
      };
    }

    if (profile && profile.role !== "admin") {
      return {
        authorized: false,
        userId: user.id,
        adminUsername: profile.username,
        error: "Forbidden: Admin access required",
      };
    }

    return {
      authorized: true,
      userId: user.id,
      adminUsername: profile?.username || user.email?.split("@")[0] || "Admin",
      error: null,
    };
  } catch (err: any) {
    return {
      authorized: false,
      userId: null,
      adminUsername: null,
      error: err?.message || "Internal auth error",
    };
  }
}

/**
 * Helper to record administrative activity log
 */
export async function logAdminActivity(
  adminId: string | null,
  adminUsername: string,
  action: string,
  targetType: string = "system",
  targetId?: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await supabaseAdmin.from("admin_activity_logs").insert({
      admin_id: adminId,
      admin_username: adminUsername,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to insert admin activity log:", err);
  }
}
