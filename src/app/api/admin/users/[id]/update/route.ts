import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession, logAdminActivity } from "@/lib/supabase/server-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const userId = params.id;

  try {
    const body = await req.json();
    const { username, email, status, role } = body;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (username !== undefined) updatePayload.username = username.trim();
    if (email !== undefined) updatePayload.email = email.trim();
    if (status !== undefined && ["active", "suspended"].includes(status)) {
      updatePayload.status = status;
    }
    if (role !== undefined && ["user", "admin"].includes(role)) {
      updatePayload.role = role;
    }

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log admin activity
    const actionText = status === "suspended" ? `Suspended user "${updatedProfile.username}"` : `Updated user "${updatedProfile.username}"`;
    await logAdminActivity(
      authRes.userId,
      authRes.adminUsername || "Admin",
      actionText,
      "user",
      userId,
      { status, role, username }
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
