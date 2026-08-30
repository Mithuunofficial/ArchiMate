import { NextRequest, NextResponse } from "next/server";
import { requireApprovedUser } from "@/lib/auth-guard";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export async function POST(req: NextRequest) {
  // Enforce dual approval check on server
  const check = await requireApprovedUser(req);
  if (!check.authorized) {
    return NextResponse.json(
      { error: check.error || "Your account is awaiting approval." },
      { status: check.status }
    );
  }

  try {
    const body = await req.json();
    const { id, name, description, architecture } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.project_name = name;
    if (description !== undefined) updatePayload.description = description;
    if (architecture !== undefined) {
      updatePayload.architecture = architecture;
      updatePayload.node_count = architecture.nodes?.length || 0;
      if (architecture.metadata?.technologies) {
        updatePayload.tech_stack = architecture.metadata.technologies;
      }
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", check.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save project." }, { status: 500 });
  }
}
