import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, verifyAdminSession } from "@/lib/supabase/server-admin";

export async function GET(req: NextRequest) {
  const authRes = await verifyAdminSession(req);
  if (!authRes.authorized) {
    return NextResponse.json({ error: authRes.error }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q") || "";

  const defaultAdminUser = {
    id: "268b5fe1-46cf-4e16-8b8f-8cd1ac6c17f6",
    username: process.env.ADMIN_USERNAME || "Admin-Archimate",
    email: "archimate.org@gmail.com",
    role: "admin",
    status: "active",
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

    // Fetch project counts for users
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id, user_id");

    const projectCounts: Record<string, number> = {};
    (projects || []).forEach((p) => {
      projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1;
    });

    const userList = (users || []).map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role || "user",
      status: u.status || "active",
      projectCount: projectCounts[u.id] || 0,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));

    if (userList.length === 0) {
      userList.push(defaultAdminUser);
    }

    return NextResponse.json({ users: userList });
  } catch (err: any) {
    return NextResponse.json({ users: [defaultAdminUser] });
  }
}
