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

    // Fetch Supabase Auth user to check email verification status
    let isEmailConfirmed = false;
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      isEmailConfirmed = !!authUser?.user?.email_confirmed_at;
    } catch {
      // Ignore auth fetch error
    }

    const emailVerified = isEmailConfirmed || !!profile.email_verified;
    const adminApproved = !!profile.admin_approved;

    let computedStatus: "pending" | "approved" | "rejected" | "suspended" = "pending";
    const rawStatus = profile.account_status || profile.status;

    if (rawStatus === "suspended" || rawStatus === "rejected") {
      computedStatus = rawStatus;
    } else if (emailVerified || adminApproved || profile.role === "admin") {
      computedStatus = "approved";
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role || "user",
        status: computedStatus,
        accountStatus: computedStatus,
        emailVerified,
        adminApproved,
        approvedBy: profile.approved_by || null,
        approvedAt: profile.approved_at || null,
        rejectedBy: profile.rejected_by || null,
        rejectedAt: profile.rejected_at || null,
        suspendedAt: profile.suspended_at || null,
        rejectionReason: profile.rejection_reason || null,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      projects: userProjects || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
