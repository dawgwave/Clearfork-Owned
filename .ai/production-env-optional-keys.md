# Production env keys (Gemini, reCAPTCHA, Search Console)

## Does the app use them?

| Variable | Used for | If unset / placeholder (`YOUR_*`) |
|----------|-----------|-------------------------------------|
| `GEMINI_API_KEY` | `/api/quote-assistant` and quote-assistant upload (Gemini) | Returns **500** / “AI not configured” for those APIs. Rest of the site works; AI quote assistant is **off**. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 on forms + server checks via `isRecaptchaVerificationEnabled()` | Code treats `YOUR_*` and weak keys as **not configured**: script **not** loaded (`layout.tsx`), verification **skipped** on login/register/contact. **`quote-submit`** explicitly **allows submit without a token** when verification is disabled (`quote-submit/route.ts`: missing token or verification off → passes). **Spam/abuse risk** on public quote/contact flows if you rely on captcha for prod. |
| `GOOGLE_SITE_VERIFICATION` | `metadata.verification.google` in root layout (Search Console HTML tag) | **No functional breakage.** Worst case you omit verification or ship a useless meta value if you literally set `YOUR_VERIFICATION_CODE`. |

## How “bad” is leaving them unset?

- **Gemini:** Fine if you don’t care about the in-browser AI quote assistant and upload-based extraction; those features simply won’t work.

- **reCAPTCHA:** Not a crash—by design the app turns captcha off when keys aren’t “real.” **Downside:** easier automated junk on quote submission (and any path that skips checks when disabled). For a production marketing site with forms, you usually **want real keys**.

- **Search Console verification:** Cosmetic / SEO tooling only; safe to omit until you verify the property.

## Bottom line

Leaving **GEMINI** unset only disables AI features. Leaving **reCAPTCHA** unset disables captcha and weakens bot resistance, especially on **`/api/quote-submit`**. **`GOOGLE_SITE_VERIFICATION`** is optional for running the app.
