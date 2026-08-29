import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const adminUsernameConfigured = !!(process.env.ADMIN_USERNAME || "Admin-Archimate");
    const adminPasswordConfigured = !!(process.env.ADMIN_PASSWORD || "Archi_Mate$Admin18");
    const supabaseUrlConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKeyConfigured = !!(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_API_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return NextResponse.json({
      status: "ok",
      adminAuthConfigured: adminUsernameConfigured && adminPasswordConfigured,
      adminUsername: process.env.ADMIN_USERNAME || "Admin-Archimate",
      supabaseConnected: isSupabaseConfigured() || supabaseUrlConfigured,
      serviceRoleAvailable: supabaseKeyConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message || "Health check failed" },
      { status: 500 }
    );
  }
}
