import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { supabase } from "@/lib/supabase/client";
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

    let targetEmail: string | null = null;
    let profileData: any = null;
    let devRecord = DevAuthStore.findByUsername(trimmedUsername);

    // 1. Resolve username to email using Supabase profiles table
    try {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .ilike("username", trimmedUsername)
        .maybeSingle();

      if (profile) {
        profileData = profile;
        targetEmail = profile.email;
      }
    } catch {
      // Ignore network errors
    }

    // Check dev store fallback if profile not found in Supabase
    if (!targetEmail && devRecord) {
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

    // If username is not found
    if (!targetEmail) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 2. Check if account is suspended
    if (profileData && profileData.status === "suspended") {
      return NextResponse.json(
        { error: "Account has been suspended. Access denied." },
        { status: 403 }
      );
    }

    let authenticatedUser: any = null;
    let authenticatedSession: any = null;

    // 3. Authenticate with Supabase Auth using resolved email + password
    try {
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: trimmedPassword,
      });

      if (authData?.user && authData?.session) {
        authenticatedUser = authData.user;
        authenticatedSession = authData.session;
      }
    } catch {
      // Ignore network errors
    }

    // 4. Fallback authentication via DevAuthStore if Supabase Auth host was unreachable
    if (!authenticatedUser && devRecord) {
      if (devRecord.passwordHash === trimmedPassword) {
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

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
      session: authenticatedSession,
      profile: profileData || {
        id: authenticatedUser.id,
        username: trimmedUsername,
        email: targetEmail,
        role: "user",
        status: "active",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
