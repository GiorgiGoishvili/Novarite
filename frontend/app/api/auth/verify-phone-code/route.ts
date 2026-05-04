import { NextRequest, NextResponse } from "next/server";
import { checkPhoneVerification } from "@/lib/sms";

function normalise(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json() as { phone?: unknown; code?: unknown };
    const phone = normalise(typeof body.phone === "string" ? body.phone.trim() : "");
    const code  = typeof body.code === "string" ? body.code.trim() : "";

    if (!phone || !code)        return json({ error: "Phone and code are required." }, 400);
    if (!/^\d{6}$/.test(code)) return json({ error: "Code must be exactly 6 digits." }, 400);

    const result = await checkPhoneVerification(phone, code);

    if (result.ok) return json({ ok: true });
    return json({ error: result.error ?? "Verification failed." }, 400);
  } catch {
    return json({ error: "Internal server error." }, 500);
  }
}
