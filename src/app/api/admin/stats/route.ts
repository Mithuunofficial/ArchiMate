import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession } from "@/lib/supabase/server-admin";

export async function GET(req: NextRequest) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const defaultStats = {
    totalUsers: 1,
    pendingApproval: 0,
    approvedUsers: 1,
    rejectedUsers: 0,
    suspendedUsers: 0,
    totalProjects: 0,
    totalArchitectures: 0,
    newUsersThisWeek: 1,
  };

  try {
    // 1. Fetch profiles to compute status breakdown
    const { data: profiles, error: err1 } = await supabaseAdmin
      .from("profiles")
      .select("id, role, status, account_status, email_verified, admin_approved, created_at");

    if (err1 || !profiles) {
      return NextResponse.json(defaultStats);
    }

    // Auth users list for email verification sync
    const authUsersMap: Record<string, boolean> = {};
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      (authData?.users || []).forEach((au) => {
        authUsersMap[au.id] = !!au.email_confirmed_at;
      });
    } catch {
      // Ignore listUsers failure
    }

    let pendingApproval = 0;
    let approvedUsers = 0;
    let rejectedUsers = 0;
    let suspendedUsers = 0;

    profiles.forEach((p) => {
      const emailVerified = authUsersMap[p.id] ?? p.email_verified ?? false;
      const adminApproved = p.admin_approved ?? false;
      const rawStatus = p.account_status || p.status;

      if (rawStatus === "suspended") {
        suspendedUsers++;
      } else if (rawStatus === "rejected") {
        rejectedUsers++;
      } else if (emailVerified || adminApproved || p.role === "admin") {
        approvedUsers++;
      } else {
        pendingApproval++;
      }
    });

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
    const newUsersThisWeek = profiles.filter((p) => new Date(p.created_at) >= new Date(sevenDaysAgo)).length;

    return NextResponse.json({
      totalUsers: profiles.length,
      pendingApproval,
      approvedUsers,
      rejectedUsers,
      suspendedUsers,
      totalProjects: totalProjects || 0,
      totalArchitectures: totalArchitectures || 0,
      newUsersThisWeek,
    });
  } catch (err: any) {
    return NextResponse.json(defaultStats);
  }
}
