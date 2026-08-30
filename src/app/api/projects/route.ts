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
    const { name, description, architecture } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .insert({
        user_id: check.user.id,
        project_name: name,
        description: description || "",
        architecture: architecture || {},
        node_count: architecture?.nodes?.length || 0,
        tech_stack: architecture?.metadata?.technologies || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create project." }, { status: 500 });
  }
}
