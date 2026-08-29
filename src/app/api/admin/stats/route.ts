import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession } from "@/lib/supabase/server-admin";

export async function GET(req: NextRequest) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const defaultStats = {
    totalUsers: 1,
    totalProjects: 0,
    totalArchitectures: 0,
    newUsersThisWeek: 1,
  };

  try {
    // 1. Total Users
    const { count: totalUsers, error: err1 } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (err1) {
      return NextResponse.json(defaultStats);
    }

    // 2. Total Projects
    const { count: totalProjects } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true });

    // 3. Total Architectures (projects with nodes)
    const { count: totalArchitectures } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .gt("node_count", 0);

    // 4. New Users this week
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newUsersThisWeek } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    return NextResponse.json({
      totalUsers: totalUsers || 1,
      totalProjects: totalProjects || 0,
      totalArchitectures: totalArchitectures || 0,
      newUsersThisWeek: newUsersThisWeek || 1,
    });
  } catch (err: any) {
    return NextResponse.json(defaultStats);
  }
}
