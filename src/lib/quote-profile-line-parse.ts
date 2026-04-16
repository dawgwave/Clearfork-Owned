import type { QuoteFormValues } from "@/lib/quote-types";
import { normalizeExtractedQuoteValue } from "@/lib/quote-types";

/**
 * Maps common "Customer profile" / declarations-style labels (any case) to form keys.
 * Used to supplement LLM extraction when the document is plain labeled lines (e.g. DOCX).
 */
const LABEL_TO_KEY: Record<string, keyof QuoteFormValues> = {
  "first name": "firstName",
  "given name": "firstName",
  "last name": "lastName",
  surname: "lastName",
  "date of birth": "dateOfBirth",
  dob: "dateOfBirth",
  birthday: "dateOfBirth",
  "marital status": "maritalStatus",
  gender: "gender",
  sex: "gender",
  "street address": "streetAddress",
  address: "streetAddress",
  "home address": "streetAddress",
  state: "state",
  "zip code": "zipCode",
  zip: "zipCode",
  postcode: "zipCode",
  "postal code": "zipCode",
  "phone number": "phoneNumber",
  phone: "phoneNumber",
  mobile: "phoneNumber",
  cell: "phoneNumber",
  "email address": "emailAddress",
  email: "emailAddress",
  "driver license number": "driverLicenseNumber",
  "drivers license number": "driverLicenseNumber",
  "driver's license": "driverLicenseNumber",
  "dl number": "driverLicenseNumber",
  "license number": "driverLicenseNumber",
  "social security number": "socialSecurityNumber",
  ssn: "socialSecurityNumber",
  "additional driver first name": "additionalDriverFirstName",
  "additional driver last name": "additionalDriverLastName",
  "additional driver date of birth": "additionalDriverDOB",
  "additional driver dob": "additionalDriverDOB",
  "additional driver license": "additionalDriverLicense",
  "additional driver license number": "additionalDriverLicense",
  "additional driver driver license number": "additionalDriverLicense",
  "second driver license": "additionalDriverLicense",
  "vin number": "vinNumber",
  vin: "vinNumber",
  "vehicle use": "vehicleUse",
  "primary use": "vehicleUse",
  "estimated annual mileage": "estimatedAnnualMileage",
  "annual mileage": "estimatedAnnualMileage",
  mileage: "estimatedAnnualMileage",
  occupation: "occupation",
  job: "occupation",
  "military service": "militaryService",
  military: "militaryService",
  veteran: "militaryService",
  student: "isStudent",
  "full-time student": "isStudent",
  "are you a student": "isStudent",
  "can receive texts": "canReceiveTexts",
  "text messages": "canReceiveTexts",
};

function shouldSkipSsnValue(v: string): boolean {
  const t = v.trim().toLowerCase();
  return (
    t === "" ||
    t === "n/a" ||
    t === "na" ||
    t === "none" ||
    t === "not provided" ||
    t === "not applicable" ||
    t === "—" ||
    t === "-"
  );
}

function normalizeLabel(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?:]+$/, "");
}

/**
 * Parse "Label: value" lines (typical customer profile / intake DOCX).
 * Values are normalized the same way as API extraction.
 */
export function extractQuoteFieldsFromLabeledDocumentText(
  text: string,
): Partial<Record<keyof QuoteFormValues, string>> {
  const out: Partial<Record<keyof QuoteFormValues, string>> = {};
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.includes(":")) continue;
    const colon = line.indexOf(":");
    const labelPart = line.slice(0, colon).trim();
    let valuePart = line.slice(colon + 1).trim();
    if (!labelPart || !valuePart) continue;

    const key = LABEL_TO_KEY[normalizeLabel(labelPart)];
    if (!key) continue;

    if (key === "socialSecurityNumber" && shouldSkipSsnValue(valuePart)) continue;

    const normalized = normalizeExtractedQuoteValue(key, valuePart);
    if (!normalized || !String(normalized).trim()) continue;

    out[key] = normalized;
  }

  return out;
}

/**
 * Prefer model values when present; fill gaps from heuristic line parsing.
 */
export function mergeModelUpdatesWithHeuristic(
  model: Partial<Record<keyof QuoteFormValues, string>>,
  heuristic: Partial<Record<keyof QuoteFormValues, string>>,
): Partial<Record<keyof QuoteFormValues, string>> {
  const merged: Partial<Record<keyof QuoteFormValues, string>> = { ...heuristic };
  for (const [k, v] of Object.entries(model) as [keyof QuoteFormValues, string][]) {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      merged[k] = v;
    }
  }
  return merged;
}
