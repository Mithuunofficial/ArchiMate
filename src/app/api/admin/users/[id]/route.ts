import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession } from "@/lib/supabase/server-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const userId = params.id;

  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's projects
    const { data: userProjects } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role || "user",
        status: profile.status || "active",
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      projects: userProjects || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
