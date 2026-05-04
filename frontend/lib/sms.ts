/**
 * Twilio Verify integration — server-side only.
 *
 * Uses the official twilio npm package with the Verify Service API.
 * Reads TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID from env.
 *
 * sendPhoneVerification  — triggers a Twilio Verify SMS (Twilio manages the code)
 * checkPhoneVerification — validates the code the user entered against Twilio Verify
 */

import twilio from "twilio";

export interface VerifyResult {
  ok:             boolean;
  notConfigured?: boolean;
  error?:         string;
}

function getCredentials(): { accountSid: string; authToken: string; serviceSid: string } | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken  = process.env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

  console.log("[Twilio] Credential check:", {
    hasAccountSid:       Boolean(accountSid),
    hasAuthToken:        Boolean(authToken),
    hasVerifyServiceSid: Boolean(serviceSid),
  });

  if (!accountSid || !authToken || !serviceSid) return null;
  return { accountSid, authToken, serviceSid };
}

function missingError(): VerifyResult {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken  = process.env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

  const missing = [
    !accountSid ? "TWILIO_ACCOUNT_SID"       : null,
    !authToken  ? "TWILIO_AUTH_TOKEN"         : null,
    !serviceSid ? "TWILIO_VERIFY_SERVICE_SID" : null,
  ].filter(Boolean).join(", ");

  return {
    ok:            false,
    notConfigured: true,
    error:         `Twilio Verify is not configured. Missing: ${missing}.`,
  };
}

export async function sendPhoneVerification(to: string): Promise<VerifyResult> {
  const creds = getCredentials();
  if (!creds) return missingError();

  try {
    const client = twilio(creds.accountSid, creds.authToken);
    await client.verify.v2
      .services(creds.serviceSid)
      .verifications.create({ to, channel: "sms" });
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Failed to send verification SMS: ${message}` };
  }
}

export async function checkPhoneVerification(
  to:   string,
  code: string,
): Promise<VerifyResult> {
  const creds = getCredentials();
  if (!creds) return missingError();

  try {
    const client = twilio(creds.accountSid, creds.authToken);
    const check  = await client.verify.v2
      .services(creds.serviceSid)
      .verificationChecks.create({ to, code });

    if (check.status === "approved") return { ok: true };
    return { ok: false, error: "Invalid or expired verification code." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Verification check failed: ${message}` };
  }
}
