import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, logAdminActivity } from "@/lib/supabase/server-admin";

export async function POST(req: NextRequest) {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || "Admin-Archimate";
    const adminPassword = process.env.ADMIN_PASSWORD || "Archi_Mate$Admin18";
    const adminEmail = "archimate.org@gmail.com";

    // 1. Check if admin profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("username", adminUsername)
      .maybeSingle();

    if (existingProfile) {
      if (existingProfile.role !== "admin" || existingProfile.status !== "active") {
        await supabaseAdmin
          .from("profiles")
          .update({ role: "admin", status: "active" })
          .eq("id", existingProfile.id);
      }
      return NextResponse.json({
        success: true,
        message: "Admin account already exists and is fully configured.",
        email: existingProfile.email,
        username: adminUsername,
      });
    }

    // 2. Create Auth user via Supabase Admin API or fallback
    let userId: string | null = null;
    try {
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          username: adminUsername,
          role: "admin",
        },
      });

      if (authData?.user) {
        userId = authData.user.id;
      }
    } catch (adminErr) {
      console.error("Admin setup notice:", adminErr);
    }

    if (!userId) {
      try {
        const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers();
        const matched = listUsers?.users?.find((u) => u.email === adminEmail);
        if (matched) userId = matched.id;
      } catch {
        // Ignore
      }
    }

    if (!userId) {
      userId = "admin-archimate-id";
    }

    // 3. Upsert admin profile
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        username: adminUsername,
        email: adminEmail,
        role: "admin",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    await logAdminActivity(userId, adminUsername, "Initial Admin Setup Executed", "system", userId);

    return NextResponse.json({
      success: true,
      message: "Admin account initialized successfully.",
      username: adminUsername,
      email: adminEmail,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Setup failed" }, { status: 500 });
  }
}
