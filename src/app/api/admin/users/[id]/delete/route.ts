import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession, logAdminActivity } from "@/lib/supabase/server-admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const userId = params.id;

  try {
    // 1. Fetch user profile for logging before deletion
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("username, email")
      .eq("id", userId)
      .single();

    const targetName = targetProfile?.username || targetProfile?.email || userId;

    // 2. Delete Auth user via Supabase Admin API
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      console.warn("Delete user auth warning (proceeding with profile delete):", deleteAuthErr.message);
    }

    // 3. Delete profile and associated projects
    await supabaseAdmin.from("projects").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 4. Audit Log
    await logAdminActivity(
      authRes.userId,
      authRes.adminUsername || "Admin",
      `Deleted user account "${targetName}"`,
      "user",
      userId
    );

    return NextResponse.json({ success: true, message: `User ${targetName} deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete user" }, { status: 500 });
  }
}
