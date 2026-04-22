import type { LineQuoteType } from "@/lib/quote-line-schemas";
import { isRecaptchaSiteKeyConfigured } from "@/lib/recaptcha";

export async function submitLineQuoteToApi(
  quoteType: LineQuoteType,
  data: Record<string, string>,
): Promise<{ id: number }> {
  let recaptchaToken: string | undefined;
  const win = window as unknown as {
    grecaptcha?: {
      execute: (key: string, opts: { action: string }) => Promise<string>;
    };
  };
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (win.grecaptcha && siteKey && isRecaptchaSiteKeyConfigured()) {
    try {
      recaptchaToken = await win.grecaptcha.execute(siteKey, {
        action: "quote_submit",
      });
    } catch {
      /* omit token */
    }
  }

  const response = await fetch("/api/quote-submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      quoteType,
      ...data,
      ...(recaptchaToken ? { recaptchaToken } : {}),
    }),
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Invalid response from server.");
  }

  const obj = body as { success?: boolean; id?: number; message?: string };

  if (!response.ok) {
    throw new Error(obj?.message || "Submission failed. Please try again.");
  }

  if (!obj.success || typeof obj.id !== "number") {
    throw new Error(
      obj?.message || "Quote was not saved. Please try again.",
    );
  }

  return { id: obj.id };
}
