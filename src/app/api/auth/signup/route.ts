import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { supabase } from "@/lib/supabase/client";
import { DevAuthStore } from "@/lib/dev-auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters long." },
        { status: 400 }
      );
    }

    // Password validation rules
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);

    if (!hasMinLength || !hasNumber || !hasUppercase) {
      return NextResponse.json(
        { error: "Password does not meet the requirements." },
        { status: 400 }
      );
    }

    // 1. Check existing username in local dev store
    if (DevAuthStore.findByUsername(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 400 }
      );
    }

    // 2. Check existing email in local dev store
    if (DevAuthStore.findByEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // 3. Check existing username/email in Supabase profiles table if reachable
    try {
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, username")
        .ilike("username", trimmedUsername)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 400 }
        );
      }

      const { data: existingEmailProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .ilike("email", trimmedEmail)
        .maybeSingle();

      if (existingEmailProfile) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 400 }
        );
      }
    } catch {
      // Ignore network errors and proceed to user creation / fallback
    }

    let user: any = null;
    let session: any = null;
    let needsEmailVerification = false;

    // 4. Register user with Supabase Auth
    try {
      const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
        email: trimmedEmail,
        password: password,
        email_confirm: true,
        user_metadata: { username: trimmedUsername, role: "user" },
      });

      if (adminErr) {
        const { data: clientData, error: clientErr } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            data: { username: trimmedUsername, role: "user" },
          },
        });

        if (clientErr) {
          const isDup =
            clientErr.message.includes("already registered") ||
            clientErr.message.includes("User already exists") ||
            clientErr.status === 422;

          if (isDup) {
            return NextResponse.json(
              { error: "This email is already registered." },
              { status: 400 }
            );
          }
        } else if (clientData?.user) {
          user = clientData.user;
          session = clientData.session;
        }
      } else if (adminData?.user) {
        user = adminData.user;
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });
        session = signInData?.session || null;
      }

      if (user) {
        await supabaseAdmin.from("profiles").upsert(
          {
            id: user.id,
            username: trimmedUsername,
            email: trimmedEmail,
            role: "user",
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }
    } catch {
      // Ignore network errors and handle dev fallback below
    }

    // 5. Fallback creation in dev store if Supabase Auth host was unreachable
    if (!user) {
      const devRecord = DevAuthStore.createUser(trimmedUsername, trimmedEmail, password);
      user = {
        id: devRecord.id,
        email: devRecord.email,
        user_metadata: { username: devRecord.username, role: "user" },
        aud: "authenticated",
        role: "authenticated",
        created_at: devRecord.createdAt,
      };

      session = {
        access_token: `session-dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        refresh_token: `refresh-dev-${Date.now()}`,
        expires_in: 604800,
        token_type: "bearer",
        user,
      };
    } else {
      // Also sync to dev store for local signin consistency
      DevAuthStore.createUser(trimmedUsername, trimmedEmail, password);
    }

    needsEmailVerification = !session && !!user;

    return NextResponse.json({
      success: true,
      user,
      session,
      needsEmailVerification,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}
