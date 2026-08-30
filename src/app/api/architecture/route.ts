import { NextRequest, NextResponse } from "next/server";
import { requireApprovedUser } from "@/lib/auth-guard";

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
    return NextResponse.json({ success: true, message: "Architecture processed successfully.", data: body });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process architecture." }, { status: 500 });
  }
}
