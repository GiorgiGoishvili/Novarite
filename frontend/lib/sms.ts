/**
 * SMS sending utility — server-side only.
 *
 * Uses the Twilio Messaging REST API directly (no npm package required).
 * Reads TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER from env.
 *
 * Returns a typed result object; never throws.
 * If credentials are missing, returns { ok: false, notConfigured: true }.
 */

export interface SmsResult {
  ok:             boolean;
  notConfigured?: boolean;
  error?:         string;
}

export async function sendVerificationSms(
  to:   string,
  code: string
): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken  = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from       = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (!accountSid || !authToken || !from) {
    return {
      ok:            false,
      notConfigured: true,
      error:         "SMS service is not configured (Twilio credentials missing).",
    };
  }

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method:  "POST",
        headers: {
          Authorization:  `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To:   to,
          From: from,
          Body: `Your Novarite verification code is: ${code}\n\nExpires in 10 minutes. Do not share this code.`,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json() as { message?: string };
      return {
        ok:    false,
        error: data.message ?? `Twilio error ${response.status}`,
      };
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Failed to send SMS: ${message}` };
  }
}
