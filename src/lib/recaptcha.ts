/** Public site key looks real (not template placeholders). */
export function isRecaptchaSiteKeyConfigured(): boolean {
  const site = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  if (!site) return false;
  if (site === "your_recaptcha_site_key_here") return false;
  if (/^YOUR_/i.test(site)) return false;
  if (/placeholder/i.test(site)) return false;
  return site.length >= 20;
}

/** True when real keys are set (not .env placeholders). Used to skip verify in dev/staging. */
export function isRecaptchaVerificationEnabled(): boolean {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim() ?? "";
  if (!secret || !isRecaptchaSiteKeyConfigured()) return false;
  if (secret === "your_recaptcha_secret_key_here") return false;
  if (/^YOUR_/i.test(secret)) return false;
  if (/placeholder|your_recaptcha_secret/i.test(secret)) return false;
  return secret.length >= 30;
}

export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { success: false, score: 0 };

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", token);

  try {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await resp.json();
    return { success: !!data.success, score: Number(data.score || 0) };
  } catch {
    return { success: false, score: 0 };
  }
}
