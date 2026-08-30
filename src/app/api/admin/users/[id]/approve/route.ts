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
  const now = new Date().toISOString();

  try {
    const updatePayload = {
      admin_approved: true,
      account_status: "approved",
      status: "approved",
      approved_by: authRes.adminUsername || authRes.userId || "admin",
      approved_at: now,
      updated_at: now,
    };

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Write audit log
    await logAdminActivity(
      authRes.userId,
      authRes.adminUsername || "Admin",
      `Approved user account "${updatedProfile.username}"`,
      "user",
      userId,
      { action: "USER_APPROVED", approved_at: now }
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `User ${updatedProfile.username} has been approved.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to approve user account." },
      { status: 500 }
    );
  }
}
