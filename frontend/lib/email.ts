/**
 * Email sending utility — server-side only.
 *
 * Reads RESEND_API_KEY and EMAIL_FROM from environment variables.
 * Returns a typed result object; never throws, so API routes can handle
 * errors without try-catching this call.
 *
 * If RESEND_API_KEY is not set, returns { ok: false, notConfigured: true }
 * so the caller can print the code to the dev console and still proceed.
 */

export interface EmailResult {
  ok:             boolean;
  notConfigured?: boolean;
  error?:         string;
}

export async function sendVerificationEmail(
  to:   string,
  code: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from   = process.env.EMAIL_FROM?.trim() ?? "Novarite <noreply@novarite.app>";

  if (!apiKey) {
    return {
      ok:             false,
      notConfigured:  true,
      error:          "Email service is not configured (RESEND_API_KEY missing).",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to:      [to],
      subject: "Your Novarite verification code",
      html:    buildEmailHtml(code),
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Failed to send email: ${message}` };
  }
}

function buildEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:420px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:40px;">

    <div style="margin-bottom:24px;">
      <span style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.5px;">Novarite</span>
    </div>

    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">
      Verify your email address
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
      Enter this code on the Novarite profile page to confirm your email address.
    </p>

    <div style="background:#f3f4f6;border-radius:10px;padding:20px;text-align:center;margin-bottom:28px;">
      <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#111827;font-family:monospace;">
        ${code}
      </span>
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
      This code expires in <strong>10 minutes</strong>.<br>
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;
}
