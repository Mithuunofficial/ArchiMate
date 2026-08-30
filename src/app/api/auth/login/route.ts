import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { DevAuthStore } from "@/lib/dev-auth-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const configured = isSupabaseConfigured();

    let targetEmail: string | null = null;
    let profileData: any = null;

    // Check if input is directly an email address
    if (trimmedUsername.includes("@")) {
      targetEmail = trimmedUsername.toLowerCase();
    }

    // 1. Resolve username to email using Supabase profiles table if configured
    if (configured) {
      try {
        const query = supabaseAdmin.from("profiles").select("*");
        const { data: profile } = targetEmail
          ? await query.ilike("email", targetEmail).maybeSingle()
          : await query.ilike("username", trimmedUsername).maybeSingle();

        if (profile) {
          profileData = profile;
          targetEmail = profile.email;
        }
      } catch (err: any) {
        console.error("[Login Profile Lookup Error]:", err?.message || err);
      }
    }

    // Check dev store fallback if unconfigured or profile not found in Supabase
    if (!targetEmail && (!configured || process.env.NODE_ENV !== "production")) {
      const devRecord = DevAuthStore.findByUsername(trimmedUsername) || DevAuthStore.findByEmail(trimmedUsername);
      if (devRecord) {
        targetEmail = devRecord.email;
        profileData = {
          id: devRecord.id,
          username: devRecord.username,
          email: devRecord.email,
          role: devRecord.role,
          status: devRecord.status,
          created_at: devRecord.createdAt,
          updated_at: devRecord.updatedAt,
        };
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 2. Check if account is suspended or rejected
    if (profileData) {
      const currentStatus = profileData.account_status || profileData.status;
      if (currentStatus === "suspended") {
        return NextResponse.json(
          { error: "Your account has been suspended by an administrator." },
          { status: 403 }
        );
      }
      if (currentStatus === "rejected") {
        return NextResponse.json(
          { error: "Your account registration was rejected by an administrator." },
          { status: 403 }
        );
      }
    }

    let authenticatedUser: any = null;
    let authenticatedSession: any = null;

    // 3. Authenticate with Supabase Auth using resolved email + password
    if (configured) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: trimmedPassword,
      });

      if (authError) {
        console.error("[Supabase Login Error]:", authError);

        const isApiKeyErr =
          authError.message?.includes("Invalid API key") ||
          authError.message?.includes("invalid_api_key");

        if (isApiKeyErr) {
          console.error("[Supabase Config Error] Invalid API key received from Supabase. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
          return NextResponse.json(
            { error: "Authentication service configuration error. Please verify NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables." },
            { status: 503 }
          );
        }

        return NextResponse.json(
          { error: "Invalid username or password." },
          { status: 401 }
        );
      } else if (authData?.user && authData?.session) {
        authenticatedUser = authData.user;
        authenticatedSession = authData.session;
      }
    }

    // 4. Fallback authentication via DevAuthStore ONLY in offline local dev mode
    if (!authenticatedUser && !configured && process.env.NODE_ENV !== "production") {
      const devRecord = DevAuthStore.findByUsername(trimmedUsername) || DevAuthStore.findByEmail(trimmedUsername);
      if (devRecord && devRecord.passwordHash === trimmedPassword) {
        authenticatedUser = {
          id: devRecord.id,
          email: devRecord.email,
          user_metadata: { username: devRecord.username, role: devRecord.role },
          aud: "authenticated",
          role: "authenticated",
          created_at: devRecord.createdAt,
        };

        authenticatedSession = {
          access_token: `session-dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          refresh_token: `refresh-dev-${Date.now()}`,
          expires_in: 604800,
          token_type: "bearer",
          user: authenticatedUser,
        };
      }
    }

    if (!authenticatedUser || !authenticatedSession) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Sync email verification status if verified via Supabase Auth
    const isEmailConfirmed = !!authenticatedUser.email_confirmed_at;
    const emailVerified = isEmailConfirmed || !!profileData?.email_verified;
    const adminApproved = !!profileData?.admin_approved;

    let computedStatus: "pending" | "approved" | "rejected" | "suspended" = "pending";
    const rawStatus = profileData?.account_status || profileData?.status;
    if (rawStatus === "suspended" || rawStatus === "rejected") {
      computedStatus = rawStatus;
    } else if (emailVerified || adminApproved) {
      computedStatus = "approved";
    }

    // Update profile table in background if status changed or email was confirmed
    if (configured && profileData && (emailVerified !== profileData.email_verified || computedStatus !== profileData.account_status)) {
      try {
        await supabaseAdmin
          .from("profiles")
          .update({
            email_verified: emailVerified,
            account_status: computedStatus,
            status: computedStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authenticatedUser.id);
      } catch (err: any) {
        console.error("[Login Profile Update Error]:", err?.message || err);
      }
    }

    const responseProfile = {
      id: authenticatedUser.id,
      username: profileData?.username || trimmedUsername,
      email: targetEmail,
      role: profileData?.role || "user",
      status: computedStatus,
      accountStatus: computedStatus,
      emailVerified,
      adminApproved,
      approvedBy: profileData?.approved_by || null,
      approvedAt: profileData?.approved_at || null,
      rejectedBy: profileData?.rejected_by || null,
      rejectedAt: profileData?.rejected_at || null,
      createdAt: profileData?.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
      session: authenticatedSession,
      profile: responseProfile,
    });
  } catch (err: any) {
    console.error("[Login Internal Error]:", err?.message || err);
    return NextResponse.json(
      { error: "Authentication failed. Please try again later." },
      { status: 500 }
    );
  }
}
