/**
 * Map quote form values to values accepted by MySQL (ENUMs, booleans, mileage INT).
 * Keeps UI labels separate from storage format.
 */

export function normalizeMaritalStatus(raw: string): string {
  const s = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    single: "single",
    married: "married",
    separated: "separated",
    divorced: "divorced",
    widowed: "widowed",
  };
  return map[s] || s;
}

export function normalizeGender(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s === "female") return "female";
  if (s === "male") return "male";
  if (s === "non-specified" || s === "non_specified" || s === "other") return "other";
  return s;
}

export function normalizeVehicleUse(raw: string): string {
  const t = raw.trim();
  if (!t) return "pleasure";
  if (t === "Commute to work or school") return "commute";
  if (t === "Pleasure") return "pleasure";
  if (t === "Business") return "business";
  const lower = t.toLowerCase();
  if (lower.includes("commute")) return "commute";
  if (lower === "pleasure" || lower === "personal") return "pleasure";
  if (lower === "business") return "business";
  return "pleasure";
}

/** Form sends mileage bands; DB stores a representative INT. */
export function mileageBandToInt(raw: string): number {
  const t = raw.trim();
  if (!t) return 10000;
  switch (t) {
    case "1-5K":
      return 5000;
    case "6-10K":
      return 8000;
    case "11-15K":
      return 13000;
    case "15K+":
      return 18000;
    default: {
      const n = parseInt(t.replace(/\D/g, ""), 10);
      return Number.isFinite(n) && n > 0 ? n : 10000;
    }
  }
}

export function yesNoToBool(
  val: unknown,
  defaultVal = false,
): boolean {
  if (val === true || val === "true") return true;
  if (val === false || val === "false") return false;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    if (s === "yes" || s === "y") return true;
    if (s === "no" || s === "n" || s === "") return false;
  }
  return defaultVal;
}

/** Military field may be free text; treat common affirmative answers as true. */
export function militaryServiceToBool(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s) return false;
  if (/^(yes|y|true|1)$/.test(s)) return true;
  if (/^(no|n|false|0)$/.test(s)) return false;
  return (
    s.includes("veteran") ||
    s.includes("active") ||
    s.includes("military") ||
    s.includes("retired")
  );
}
