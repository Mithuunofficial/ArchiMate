import { NextRequest, NextResponse } from "next/server";
import { requireApprovedUser } from "@/lib/auth-guard";
import { getMockArchitectureForPrompt } from "@/mocks/presets";

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
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Requirement prompt is required." },
        { status: 400 }
      );
    }

    const architecture = getMockArchitectureForPrompt(prompt);
    return NextResponse.json({ success: true, architecture });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate architecture." },
      { status: 500 }
    );
  }
}
