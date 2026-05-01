import { NextRequest, NextResponse } from "next/server";
import { generateCode, storeCode } from "@/lib/verificationStore";
import { sendVerificationSms } from "@/lib/sms";

// Accepts E.164 international format with optional spaces/dashes/parens.
// Examples: +995555123456, +1 (555) 000-1234, +44 7911 123456
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

    if (!phone)                 return json({ error: "Phone number is required." }, 400);
    if (!PHONE_RE.test(phone)) {
      return json({
        error: "Enter a valid international phone number (e.g. +995 555 123456).",
      }, 400);
    }

    const code = generateCode();
    storeCode("phone", phone, code);

    if (process.env.NODE_ENV === "development") {
      console.log(`\n[DEV] SMS verification code for ${phone}: ${code}\n`);
    }

    const result = await sendVerificationSms(phone, code);

    if (result.notConfigured) {
      return json(
        {
          error:   result.error,
          devHint: process.env.NODE_ENV === "development"
            ? "Code printed to server console — enter it to test the full flow."
            : undefined,
        },
        503
      );
    }

    if (!result.ok) {
      return json({ error: result.error ?? "Failed to send SMS." }, 500);
    }

    return json({ ok: true, message: "SMS verification code sent." });
  } catch {
    return json({ error: "Internal server error." }, 500);
  }
}
