import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/verificationStore";

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json() as { email?: unknown; code?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const code  = typeof body.code  === "string" ? body.code.trim()  : "";

    if (!email || !code)        return json({ error: "Email and code are required." }, 400);
    if (!/^\d{6}$/.test(code)) return json({ error: "Code must be exactly 6 digits." }, 400);

    const result = verifyCode("email", email, code);

    switch (result) {
      case "ok":
        return json({ ok: true });
      case "invalid":
        return json({ error: "Invalid code." }, 400);
      case "expired":
        return json({ error: "Verification code has expired. Request a new one." }, 400);
      case "too_many_attempts":
        return json({ error: "Too many incorrect attempts. Request a new code." }, 429);
      case "not_found":
        return json({ error: "No pending verification found. Request a new code." }, 404);
    }
  } catch {
    return json({ error: "Internal server error." }, 500);
  }
}
