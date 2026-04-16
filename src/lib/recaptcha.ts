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
