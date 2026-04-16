/**
 * Ordered list for generateContent: first working model wins.
 * Override with GEMINI_MODEL in env (tried first, then these defaults).
 *
 * @see https://ai.google.dev/gemini-api/docs/models/gemini
 */
export const GEMINI_MODEL_DEFAULTS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
] as const;

export function geminiModelCandidates(): string[] {
  const env = process.env.GEMINI_MODEL?.trim();
  if (!env) return [...GEMINI_MODEL_DEFAULTS];
  const rest = GEMINI_MODEL_DEFAULTS.filter((m) => m !== env);
  return [env, ...rest];
}
