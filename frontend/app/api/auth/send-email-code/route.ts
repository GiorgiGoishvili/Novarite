import { NextRequest, NextResponse } from "next/server";
import { generateCode, storeCode } from "@/lib/verificationStore";
import { sendVerificationEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: object, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json() as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email)               return json({ error: "Email is required." }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);

    const code = generateCode();
    storeCode("email", email, code);

    // Always print to console in development — useful when email provider is
    // not yet configured so the dev can still test the full verification flow.
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[DEV] Email verification code for ${email}: ${code}\n`);
    }

    const result = await sendVerificationEmail(email, code);

    if (result.notConfigured) {
      // Provider not configured: tell the client, but note that the code IS
      // stored so it can be verified if the dev reads it from the console.
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
      return json({ error: result.error ?? "Failed to send email." }, 500);
    }

    return json({ ok: true, message: "Verification code sent to your email." });
  } catch {
    return json({ error: "Internal server error." }, 500);
  }
}
