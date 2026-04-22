import type { Metadata } from "next";
import { z } from "zod";

/** Stored on `quote_requests.quote_type` (and used by `/api/quote-submit`). */
export const LINE_QUOTE_TYPES = [
  "home",
  "umbrella",
  "boat",
  "rv",
  "atv",
  "motorcycle",
  "commercial",
  "life",
  "performance_and_bid_bonds",
  "cyber",
] as const;

export type LineQuoteType = (typeof LINE_QUOTE_TYPES)[number];

export function isLineQuoteType(v: string): v is LineQuoteType {
  return (LINE_QUOTE_TYPES as readonly string[]).includes(v);
}

/** URL path (no domain) for each line quote page. */
export const LINE_QUOTE_PATH: Record<LineQuoteType, string> = {
  home: "/get-home-quote",
  umbrella: "/get-umbrella-quote",
  boat: "/get-boat-quote",
  rv: "/get-rv-quote",
  atv: "/get-atv-quote",
  motorcycle: "/get-motorcycle-quote",
  commercial: "/get-commercial-quote",
  life: "/get-life-quote",
  performance_and_bid_bonds: "/get-performance-and-bid-bonds-quote",
  cyber: "/get-cyber-quote",
};

const SITE = "https://clearforkinsurance.com";

export const QUOTE_TYPE_LABEL: Record<string, string> = {
  auto: "Auto & home (full form)",
  home: "Homeowners / renters",
  umbrella: "Umbrella",
  boat: "Boat",
  rv: "RV",
  atv: "ATV / off-road",
  motorcycle: "Motorcycle",
  commercial: "Commercial",
  life: "Life",
  performance_and_bid_bonds: "Performance & bid bonds",
  cyber: "Cyber",
};

export function lineQuoteMetadata(type: LineQuoteType): Metadata {
  const label = QUOTE_TYPE_LABEL[type];
  const path = LINE_QUOTE_PATH[type];
  return {
    title: `${label} — request a quote`,
    description: `Submit a ${label.toLowerCase()} quote request to SIG Clearfork Insurance Group in Benbrook, TX.`,
    alternates: { canonical: `${SITE}${path}` },
  };
}

const contact = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  emailAddress: z.string().email("Valid email required"),
  phoneNumber: z.string().min(7, "Phone required"),
  streetAddress: z.string().min(1, "Street address required"),
  state: z.string().min(1, "State required"),
  zipCode: z.string().min(3, "ZIP required"),
  recaptchaToken: z.string().optional(),
});

export const LINE_QUOTE_SCHEMAS: Record<LineQuoteType, z.ZodTypeAny> = {
  home: contact.extend({
    propertyType: z.string().min(1, "Required"),
    occupancyStatus: z.string().min(1, "Required"),
    yearBuilt: z.string().min(1, "Required"),
    currentCarrier: z.string().optional(),
    coverageNeeded: z.string().min(1, "Describe coverage needed"),
  }),
  umbrella: contact.extend({
    underlyingHomeAuto: z.string().min(1, "Describe current home/auto limits"),
    desiredLiabilityLimit: z.string().min(1, "Required"),
    notableAssets: z.string().optional(),
  }),
  boat: contact.extend({
    vesselNameOrMake: z.string().min(1, "Required"),
    hullIdOrSerial: z.string().optional(),
    yearLengthHp: z.string().min(1, "Year / length / engine (approx.)"),
    navigationWaters: z.string().min(1, "Where is it used?"),
    priorClaims: z.string().optional(),
  }),
  rv: contact.extend({
    rvType: z.string().min(1, "Class A/B/C, travel trailer, etc."),
    yearMakeModel: z.string().min(1, "Required"),
    usage: z.string().min(1, "Full-time, seasonal, weekends?"),
    garagingZip: z.string().min(1, "Garaging ZIP"),
    priorClaims: z.string().optional(),
  }),
  atv: contact.extend({
    unitDescription: z.string().min(1, "Make, model, year"),
    primaryTerrain: z.string().min(1, "Trail, farm, mixed?"),
    operatorAge: z.string().min(1, "Primary operator age"),
    priorClaims: z.string().optional(),
  }),
  motorcycle: contact.extend({
    bikeDescription: z.string().min(1, "Make, model, year, cc"),
    primaryUse: z.string().min(1, "Commute, pleasure, track?"),
    riderCourses: z.string().optional(),
    priorClaims: z.string().optional(),
  }),
  commercial: contact.extend({
    legalBusinessName: z.string().min(1, "Required"),
    entityType: z.string().min(1, "LLC, Corp, sole prop…"),
    industryDescription: z.string().min(1, "What does the business do?"),
    annualRevenueBand: z.string().min(1, "Approx. annual revenue"),
    employeeCountBand: z.string().min(1, "Employee count range"),
    coverageTypesNeeded: z.string().min(1, "GL, property, WC, auto, etc."),
  }),
  life: contact.extend({
    dateOfBirth: z.string().min(1, "Date of birth (MM/DD/YYYY)"),
    coverageGoal: z.string().min(1, "Term, whole, or not sure"),
    faceAmountBand: z.string().min(1, "Desired benefit range"),
    tobaccoLast5Years: z.string().min(1, "Yes / no"),
    healthNotes: z.string().optional(),
  }),
  performance_and_bid_bonds: contact.extend({
    bondTypeNeeded: z.string().min(1, "Bid, performance, payment, etc."),
    projectOrContract: z.string().min(1, "Project / obligee description"),
    bondAmount: z.string().min(1, "Amount or range"),
    contractorLicense: z.string().optional(),
    timeframe: z.string().min(1, "When do you need the bond?"),
  }),
  cyber: contact.extend({
    annualRevenueBand: z.string().min(1, "Approx. annual revenue"),
    recordsHandledBand: z.string().min(1, "Customer / health records handled"),
    hasPii: z.string().min(1, "Stores PII? (yes/no)"),
    usesCloudVendors: z.string().optional(),
    priorIncidents: z.string().optional(),
  }),
};

const CONTACT_KEYS = new Set([
  "firstName",
  "lastName",
  "emailAddress",
  "phoneNumber",
  "streetAddress",
  "state",
  "zipCode",
  "recaptchaToken",
]);

export type LineQuoteParsed = {
  quoteType: LineQuoteType;
  contact: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    streetAddress: string;
    state: string;
    zipCode: string;
  };
  details: Record<string, unknown>;
  recaptchaToken?: string;
};

export type LineQuoteFieldDef = {
  key: string;
  label: string;
  kind: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
};

const CF: LineQuoteFieldDef[] = [
  { key: "firstName", label: "First name", kind: "text" },
  { key: "lastName", label: "Last name", kind: "text" },
  { key: "emailAddress", label: "Email", kind: "email" },
  { key: "phoneNumber", label: "Phone", kind: "tel" },
  { key: "streetAddress", label: "Street address", kind: "text" },
  { key: "state", label: "State", kind: "text", placeholder: "TX" },
  { key: "zipCode", label: "ZIP code", kind: "text" },
];

export const LINE_QUOTE_FORM_FIELDS: Record<LineQuoteType, LineQuoteFieldDef[]> = {
  home: [
    ...CF,
    {
      key: "propertyType",
      label: "Property type",
      kind: "text",
      placeholder: "Single family, condo, rental…",
    },
    {
      key: "occupancyStatus",
      label: "Occupancy",
      kind: "text",
      placeholder: "Owner-occupied, tenant, vacant…",
    },
    { key: "yearBuilt", label: "Year built (approx.)", kind: "text" },
    {
      key: "currentCarrier",
      label: "Current carrier (if any)",
      kind: "text",
    },
    {
      key: "coverageNeeded",
      label: "Coverage you need",
      kind: "textarea",
      placeholder: "Dwelling limit, replacement cost, deductibles, etc.",
    },
  ],
  umbrella: [
    ...CF,
    {
      key: "underlyingHomeAuto",
      label: "Current home / auto liability limits",
      kind: "textarea",
    },
    {
      key: "desiredLiabilityLimit",
      label: "Desired umbrella limit",
      kind: "text",
      placeholder: "$1M, $2M, etc.",
    },
    {
      key: "notableAssets",
      label: "Notable assets (optional)",
      kind: "textarea",
    },
  ],
  boat: [
    ...CF,
    { key: "vesselNameOrMake", label: "Vessel make / model", kind: "text" },
    { key: "hullIdOrSerial", label: "HIN or serial (if known)", kind: "text" },
    {
      key: "yearLengthHp",
      label: "Year, length, approximate HP",
      kind: "text",
    },
    {
      key: "navigationWaters",
      label: "Where it is used",
      kind: "text",
      placeholder: "Lakes, coastal, inland…",
    },
    { key: "priorClaims", label: "Prior claims (optional)", kind: "textarea" },
  ],
  rv: [
    ...CF,
    { key: "rvType", label: "RV type", kind: "text" },
    { key: "yearMakeModel", label: "Year, make, model", kind: "text" },
    { key: "usage", label: "How you use it", kind: "textarea" },
    { key: "garagingZip", label: "Garaging ZIP", kind: "text" },
    { key: "priorClaims", label: "Prior claims (optional)", kind: "textarea" },
  ],
  atv: [
    ...CF,
    { key: "unitDescription", label: "Unit (make, model, year)", kind: "text" },
    { key: "primaryTerrain", label: "Primary terrain / use", kind: "text" },
    { key: "operatorAge", label: "Primary operator age", kind: "text" },
    { key: "priorClaims", label: "Prior claims (optional)", kind: "textarea" },
  ],
  motorcycle: [
    ...CF,
    { key: "bikeDescription", label: "Bike (make, model, year, cc)", kind: "text" },
    { key: "primaryUse", label: "Primary use", kind: "text" },
    { key: "riderCourses", label: "MSF / rider courses (optional)", kind: "text" },
    { key: "priorClaims", label: "Prior claims (optional)", kind: "textarea" },
  ],
  commercial: [
    ...CF,
    { key: "legalBusinessName", label: "Legal business name", kind: "text" },
    { key: "entityType", label: "Entity type", kind: "text" },
    {
      key: "industryDescription",
      label: "What the business does",
      kind: "textarea",
    },
    { key: "annualRevenueBand", label: "Approx. annual revenue", kind: "text" },
    { key: "employeeCountBand", label: "Employee count range", kind: "text" },
    {
      key: "coverageTypesNeeded",
      label: "Coverage needed",
      kind: "textarea",
      placeholder: "GL, property, WC, commercial auto, cyber…",
    },
  ],
  life: [
    ...CF,
    { key: "dateOfBirth", label: "Date of birth", kind: "text", placeholder: "MM/DD/YYYY" },
    { key: "coverageGoal", label: "Coverage goal", kind: "text" },
    { key: "faceAmountBand", label: "Desired benefit range", kind: "text" },
    {
      key: "tobaccoLast5Years",
      label: "Tobacco in last 5 years",
      kind: "text",
      placeholder: "Yes / no",
    },
    { key: "healthNotes", label: "Health notes (optional)", kind: "textarea" },
  ],
  performance_and_bid_bonds: [
    ...CF,
    { key: "bondTypeNeeded", label: "Bond type", kind: "text" },
    {
      key: "projectOrContract",
      label: "Project / obligee",
      kind: "textarea",
    },
    { key: "bondAmount", label: "Bond amount or range", kind: "text" },
    {
      key: "contractorLicense",
      label: "License # or GC info (optional)",
      kind: "text",
    },
    { key: "timeframe", label: "Timeframe", kind: "text" },
  ],
  cyber: [
    ...CF,
    { key: "annualRevenueBand", label: "Approx. annual revenue", kind: "text" },
    {
      key: "recordsHandledBand",
      label: "Records / customers handled",
      kind: "text",
    },
    {
      key: "hasPii",
      label: "Stores PII or PHI?",
      kind: "text",
      placeholder: "Yes / no",
    },
    {
      key: "usesCloudVendors",
      label: "Key vendors / cloud (optional)",
      kind: "textarea",
    },
    {
      key: "priorIncidents",
      label: "Prior incidents (optional)",
      kind: "textarea",
    },
  ],
};

export function parseLineQuoteSubmission(
  quoteType: string,
  body: unknown,
): { ok: true; data: LineQuoteParsed } | { ok: false; error: string; issues?: z.ZodIssue[] } {
  if (!isLineQuoteType(quoteType)) {
    return { ok: false, error: "Invalid quote type." };
  }
  const schema = LINE_QUOTE_SCHEMAS[quoteType];
  const r = schema.safeParse(body);
  if (!r.success) {
    return { ok: false, error: "Validation failed.", issues: r.error.issues };
  }
  const v = r.data as Record<string, unknown>;
  const contact = {
    firstName: String(v.firstName),
    lastName: String(v.lastName),
    emailAddress: String(v.emailAddress),
    phoneNumber: String(v.phoneNumber),
    streetAddress: String(v.streetAddress),
    state: String(v.state),
    zipCode: String(v.zipCode),
  };
  const details: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(v)) {
    if (CONTACT_KEYS.has(key)) continue;
    if (val === "" || val === undefined) continue;
    details[key] = val;
  }
  return {
    ok: true,
    data: {
      quoteType,
      contact,
      details,
      recaptchaToken:
        typeof v.recaptchaToken === "string" ? v.recaptchaToken : undefined,
    },
  };
}
