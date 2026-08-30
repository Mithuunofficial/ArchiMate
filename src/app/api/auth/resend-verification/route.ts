import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// In-memory rate limiting map: email -> timestamp (ms)
const resendCooldowns = new Map<string, number>();
const COOLDOWN_SECONDS = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Authentication service is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const now = Date.now();
    const lastSent = resendCooldowns.get(trimmedEmail) || 0;
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remainingSeconds = COOLDOWN_SECONDS - elapsedSeconds;
      return NextResponse.json(
        {
          error: `Resend available in ${remainingSeconds} seconds.`,
          remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Call Supabase Auth resend email API
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${req.nextUrl.origin}/login?verified=true`,
      },
    });

    if (error) {
      console.error("[Resend Email Error]:", error);
      return NextResponse.json(
        { error: error.message || "Failed to resend verification email." },
        { status: 400 }
      );
    }

    // Record timestamp
    resendCooldowns.set(trimmedEmail, now);

    return NextResponse.json({
      success: true,
      message: "Verification email sent.",
      cooldownSeconds: COOLDOWN_SECONDS,
    });
  } catch (err: any) {
    console.error("[Resend Email Internal Error]:", err?.message || err);
    return NextResponse.json(
      { error: "Unable to process resend request. Please try again." },
      { status: 500 }
    );
  }
}
