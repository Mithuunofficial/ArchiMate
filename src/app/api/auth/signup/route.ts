import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
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

    const configured = isSupabaseConfigured();

    if (!configured) {
      console.warn("[SignUp] Supabase environment variables are missing or unconfigured.");

      if (process.env.NODE_ENV !== "production") {
        if (DevAuthStore.findByUsername(trimmedUsername)) {
          return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
        }
        if (DevAuthStore.findByEmail(trimmedEmail)) {
          return NextResponse.json({ error: "This email is already registered." }, { status: 400 });
        }

        const devRecord = DevAuthStore.createUser(trimmedUsername, trimmedEmail, password);
        const user = {
          id: devRecord.id,
          email: devRecord.email,
          user_metadata: { username: devRecord.username, role: "user" },
          aud: "authenticated",
          role: "authenticated",
          created_at: devRecord.createdAt,
        };

        return NextResponse.json({
          success: true,
          user,
          session: null,
          needsEmailVerification: true,
          message: "Account created (dev mode).",
        });
      }

      return NextResponse.json(
        { error: "Authentication service configuration error. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables." },
        { status: 503 }
      );
    }

    // 1. Check existing username/email in Supabase profiles table
    try {
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, username")
        .ilike("username", trimmedUsername)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
      }

      const { data: existingEmailProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .ilike("email", trimmedEmail)
        .maybeSingle();

      if (existingEmailProfile) {
        return NextResponse.json({ error: "This email is already registered." }, { status: 400 });
      }
    } catch (err: any) {
      console.error("[SignUp Profile Check Error]:", err?.message || err);
    }

    // 2. Register user with Supabase Auth
    let user: any = null;
    let session: any = null;

    const { data: clientData, error: clientErr } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password,
      options: {
        data: { username: trimmedUsername, role: "user" },
        emailRedirectTo: `${req.nextUrl.origin}/login?verified=true`,
      },
    });

    if (clientErr) {
      console.error("[Supabase SignUp Error]:", clientErr);

      const isDup =
        clientErr.message?.includes("already registered") ||
        clientErr.message?.includes("User already exists") ||
        clientErr.status === 422;

      if (isDup) {
        return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
      }

      const isApiKeyErr =
        clientErr.message?.includes("Invalid API key") ||
        clientErr.message?.includes("invalid_api_key") ||
        (clientErr.status === 401 && !isDup);

      if (isApiKeyErr) {
        console.error("[Supabase Config Error] Invalid API key received from Supabase. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
        return NextResponse.json(
          { error: "Authentication service configuration error. Please verify NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables." },
          { status: 503 }
        );
      }

      // Try admin createUser fallback if standard signUp returns network or config error
      try {
        const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
          email: trimmedEmail,
          password: password,
          email_confirm: false,
          user_metadata: { username: trimmedUsername, role: "user" },
        });

        if (adminErr) {
          console.error("[Supabase Admin CreateUser Error]:", adminErr);
          const adminIsApiKeyErr = adminErr.message?.includes("Invalid API key") || adminErr.status === 401;
          if (adminIsApiKeyErr) {
            return NextResponse.json(
              { error: "Authentication service configuration error. Please verify SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel." },
              { status: 503 }
            );
          }
          return NextResponse.json(
            { error: clientErr.message || adminErr.message || "Unable to create your account." },
            { status: 400 }
          );
        }

        user = adminData?.user;
      } catch {
        return NextResponse.json(
          { error: "Unable to create your account. Please try again later." },
          { status: 503 }
        );
      }
    } else if (clientData?.user) {
      user = clientData.user;
      session = clientData.session;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unable to create user account with Supabase Auth." },
        { status: 500 }
      );
    }

    // 3. Upsert user profile into profiles table
    const isEmailConfirmed = !!user.email_confirmed_at;
    try {
      await supabaseAdmin.from("profiles").upsert(
        {
          id: user.id,
          username: trimmedUsername,
          email: trimmedEmail,
          role: "user",
          status: isEmailConfirmed ? "approved" : "pending",
          account_status: isEmailConfirmed ? "approved" : "pending",
          email_verified: isEmailConfirmed,
          admin_approved: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (dbErr: any) {
      console.error("[Supabase Profile Upsert Error]:", dbErr?.message || dbErr);
    }

    // Sync to dev store for local signin consistency if running locally
    DevAuthStore.createUser(trimmedUsername, trimmedEmail, password);

    const needsEmailVerification = !user.email_confirmed_at;

    return NextResponse.json({
      success: true,
      user,
      session,
      needsEmailVerification,
      message: "Account created successfully. Please check your email to verify your ArchiMate account.",
    });
  } catch (err: any) {
    console.error("[SignUp Internal Error]:", err?.message || err);
    return NextResponse.json(
      { error: "Unable to create your account. Please try again later." },
      { status: 500 }
    );
  }
}
