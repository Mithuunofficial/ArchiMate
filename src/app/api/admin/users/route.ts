import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession } from "@/lib/supabase/server-admin";

export async function GET(req: NextRequest) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status")?.toLowerCase() || "all";

  const defaultAdminUser = {
    id: "268b5fe1-46cf-4e16-8b8f-8cd1ac6c17f6",
    username: process.env.ADMIN_USERNAME || "Admin-Archimate",
    email: "archimate.org@gmail.com",
    role: "admin" as const,
    status: "approved" as const,
    accountStatus: "approved" as const,
    emailVerified: true,
    adminApproved: true,
    approvedBy: "System",
    approvedAt: new Date().toISOString(),
    rejectedBy: null,
    rejectedAt: null,
    suspendedAt: null,
    rejectionReason: null,
    projectCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    let query = supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchQuery.trim()) {
      query = query.or(`username.ilike.%${searchQuery.trim()}%,email.ilike.%${searchQuery.trim()}%`);
    }

    const { data: users, error } = await query;
    if (error || !users) {
      return NextResponse.json({ users: [defaultAdminUser] });
    }

    // Fetch confirmed emails from auth.users via admin API to verify email status
    const authUsersMap: Record<string, boolean> = {};
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      (authData?.users || []).forEach((au) => {
        authUsersMap[au.id] = !!au.email_confirmed_at;
      });
    } catch {
      // Ignore if listUsers is not supported
    }

    // Fetch project counts for users
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id, user_id");

    const projectCounts: Record<string, number> = {};
    (projects || []).forEach((p) => {
      projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
    });

    let userList = (users || []).map((u) => {
      const emailVerified = authUsersMap[u.id] ?? u.email_verified ?? false;
      const adminApproved = u.admin_approved ?? false;

      let computedStatus: "pending" | "approved" | "rejected" | "suspended" = "pending";
      const rawStatus = u.account_status || u.status;

      if (rawStatus === "suspended" || rawStatus === "rejected") {
        computedStatus = rawStatus;
      } else if (emailVerified || adminApproved || u.role === "admin") {
        computedStatus = "approved";
      }

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role || "user",
        status: computedStatus,
        accountStatus: computedStatus,
        emailVerified,
        adminApproved,
        approvedBy: u.approved_by || null,
        approvedAt: u.approved_at || null,
        rejectedBy: u.rejected_by || null,
        rejectedAt: u.rejected_at || null,
        suspendedAt: u.suspended_at || null,
        rejectionReason: u.rejection_reason || null,
        projectCount: projectCounts[u.id] || 0,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      };
    });

    // Apply status filtering if specified
    if (statusFilter !== "all") {
      userList = userList.filter((u) => u.accountStatus === statusFilter);
    }

    if (userList.length === 0 && statusFilter === "all" && !searchQuery) {
      userList.push(defaultAdminUser);
    }

    return NextResponse.json({ users: userList });
  } catch (err: any) {
    return NextResponse.json({ users: [defaultAdminUser] });
  }
}
