import type { QuoteFormValues } from "@/lib/quote-types";
import { isRecaptchaSiteKeyConfigured } from "@/lib/recaptcha";

/** POST /api/quote-submit; throws if the quote was not persisted. */
export async function submitQuoteRequestToApi(
  data: QuoteFormValues,
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
      /* omit token; server skips verify when reCAPTCHA not fully configured */
    }
  }

  const response = await fetch("/api/quote-submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...data, recaptchaToken }),
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
