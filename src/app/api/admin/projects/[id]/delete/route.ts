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

  const projectId = params.id;

  try {
    const { data: targetProject } = await supabaseAdmin
      .from("projects")
      .select("project_name, user_id")
      .eq("id", projectId)
      .single();

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const projName = targetProject?.project_name || projectId;
    await logAdminActivity(
      authRes.userId,
      authRes.adminUsername || "Admin",
      `Deleted project "${projName}"`,
      "project",
      projectId
    );

    return NextResponse.json({ success: true, message: `Project ${projName} deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete project" }, { status: 500 });
  }
}
