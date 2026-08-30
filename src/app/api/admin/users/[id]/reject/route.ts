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
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : "Administrator rejected registration.";

    const updatePayload = {
      account_status: "rejected",
      status: "rejected",
      rejected_by: authRes.adminUsername || authRes.userId || "admin",
      rejected_at: now,
      rejection_reason: reason,
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
      `Rejected user account "${updatedProfile.username}"`,
      "user",
      userId,
      { action: "USER_REJECTED", rejected_at: now, reason }
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `User ${updatedProfile.username} account has been rejected.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to reject user account." },
      { status: 500 }
    );
  }
}
