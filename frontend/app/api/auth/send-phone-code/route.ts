import { NextRequest, NextResponse } from "next/server";
import { sendPhoneVerification } from "@/lib/sms";

// E.164 after stripping spaces/dashes/parens
const PHONE_RE = /^\+[1-9]\d{6,14}$/;

function normalise(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json() as { phone?: unknown };
    const raw   = typeof body.phone === "string" ? body.phone.trim() : "";
    const phone = normalise(raw);

    if (!phone) return json({ error: "Phone number is required." }, 400);
    if (!PHONE_RE.test(phone)) {
      return json({
        error: "Enter a valid international phone number starting with + (e.g. +995 555 123456).",
      }, 400);
    }

    const result = await sendPhoneVerification(phone);

    if (result.notConfigured) {
      return json({ error: result.error }, 503);
    }

    if (!result.ok) {
      return json({ error: result.error ?? "Failed to send SMS." }, 500);
    }

    return json({ ok: true, message: "SMS verification code sent." });
  } catch {
    return json({ error: "Internal server error." }, 500);
  }
}
