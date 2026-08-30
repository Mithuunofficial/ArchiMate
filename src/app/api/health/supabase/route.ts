import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ supabase: "unavailable" });
    }

    // Ping Supabase DB via lightweight head query on profiles table
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error && error.code !== "PGRST116") {
      // If error indicates network failure or auth error
      return NextResponse.json({ supabase: "unavailable" });
    }

    return NextResponse.json({ supabase: "connected" });
  } catch {
    return NextResponse.json({ supabase: "unavailable" });
  }
}
