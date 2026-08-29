import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession } from "@/lib/supabase/server-admin";

export async function GET(req: NextRequest) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q") || "";

  try {
    let query = supabaseAdmin
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (searchQuery.trim()) {
      query = query.ilike("project_name", `%${searchQuery.trim()}%`);
    }

    const { data: projects, error } = await query;
    if (error || !projects) {
      return NextResponse.json({ projects: [] });
    }

    // Fetch user profiles for owner details
    const userIds = Array.from(new Set((projects || []).map((p) => p.user_id)));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, username, email")
      .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileMap: Record<string, { username: string; email: string }> = {};
    (profiles || []).forEach((p) => {
      profileMap[p.id] = { username: p.username, email: p.email };
    });

    const projectList = (projects || []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      ownerUsername: profileMap[p.user_id]?.username || "Unknown User",
      ownerEmail: profileMap[p.user_id]?.email || "",
      name: p.project_name,
      description: p.description || "",
      techStack: p.tech_stack || [],
      architecture: p.architecture,
      nodeCount: p.node_count || (p.architecture?.nodes?.length || 0),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({ projects: projectList });
  } catch (err: any) {
    return NextResponse.json({ projects: [] });
  }
}
