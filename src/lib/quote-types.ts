import { z } from "zod";

export const quoteFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  gender: z.string().min(1, "Gender is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  canReceiveTexts: z.string().optional(),
  emailAddress: z.string().email("Valid email is required"),
  driverLicenseNumber: z.string().min(1, "Driver license number is required"),
  socialSecurityNumber: z.string().optional(),

  additionalDriverFirstName: z.string().optional(),
  additionalDriverLastName: z.string().optional(),
  additionalDriverDOB: z.string().optional(),
  additionalDriverLicense: z.string().optional(),

  vinNumber: z.string().optional(),
  vehicleUse: z.string().optional(),
  estimatedAnnualMileage: z.string().optional(),

  occupation: z.string().optional(),
  militaryService: z.string().optional(),
  isStudent: z.string().optional(),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
export type QuoteFormData = QuoteFormValues;

/** Canonical keys for the quote form — use for API/client field validation. */
export const QUOTE_FORM_FIELD_KEYS = quoteFormSchema.keyof()
  .options as readonly (keyof QuoteFormValues)[];

export function isQuoteFormFieldKey(k: string): k is keyof QuoteFormValues {
  return (QUOTE_FORM_FIELD_KEYS as readonly string[]).includes(k);
}

export const defaultQuoteValues: QuoteFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  maritalStatus: "",
  gender: "",
  streetAddress: "",
  state: "",
  zipCode: "",
  phoneNumber: "",
  canReceiveTexts: "",
  emailAddress: "",
  driverLicenseNumber: "",
  socialSecurityNumber: "",
  additionalDriverFirstName: "",
  additionalDriverLastName: "",
  additionalDriverDOB: "",
  additionalDriverLicense: "",
  vinNumber: "",
  vehicleUse: "",
  estimatedAnnualMileage: "",
  occupation: "",
  militaryService: "",
  isStudent: "",
};

export const QUOTE_FIELD_LABELS: Record<keyof QuoteFormValues, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  dateOfBirth: "Date of Birth",
  maritalStatus: "Marital Status",
  gender: "Gender",
  streetAddress: "Street Address",
  state: "State",
  zipCode: "Zip Code",
  phoneNumber: "Phone Number",
  canReceiveTexts: "Can Receive Texts",
  emailAddress: "Email Address",
  driverLicenseNumber: "Driver License Number",
  socialSecurityNumber: "Social Security Number",
  additionalDriverFirstName: "Additional Driver First Name",
  additionalDriverLastName: "Additional Driver Last Name",
  additionalDriverDOB: "Additional Driver Date of Birth",
  additionalDriverLicense: "Additional Driver License Number",
  vinNumber: "VIN Number",
  vehicleUse: "Vehicle Use",
  estimatedAnnualMileage: "Estimated Annual Mileage",
  occupation: "Occupation",
  militaryService: "Military Service",
  isStudent: "Student",
};

export const CONVERSATION_FLOW: Array<{ key: keyof QuoteFormValues; question: string }> = [
  { key: "firstName", question: "What is your first name?" },
  { key: "lastName", question: "What is your last name?" },
  { key: "dateOfBirth", question: "What is your date of birth? (MM/DD/YYYY)" },
  {
    key: "maritalStatus",
    question:
      "What is your marital status? (Single, Married, Separated, Divorced, or Widowed)",
  },
  { key: "gender", question: "What is your gender? (Female, Male, or Non-specified)" },
  { key: "streetAddress", question: "What is your street address?" },
  { key: "state", question: "What state do you live in?" },
  { key: "zipCode", question: "What is your zip code?" },
  { key: "phoneNumber", question: "What is your phone number?" },
  {
    key: "canReceiveTexts",
    question: "Can you receive text messages at that number? (Yes/No)",
  },
  { key: "emailAddress", question: "What is your email address?" },
  { key: "driverLicenseNumber", question: "What is your driver license number?" },
  {
    key: "socialSecurityNumber",
    question:
      "What is your social security number? (Optional — say 'skip' if you prefer not to share)",
  },
  {
    key: "vinNumber",
    question: "What is your vehicle's VIN number? (Say 'skip' if you don't have it)",
  },
  {
    key: "vehicleUse",
    question: "What is the primary use of your vehicle? (Commute, Pleasure, or Business)",
  },
  {
    key: "estimatedAnnualMileage",
    question: "What is your estimated annual mileage? (1-5K, 6-10K, 11-15K, or 15K+)",
  },
  {
    key: "occupation",
    question: "What is your occupation? (Optional — say 'skip' if you prefer)",
  },
  {
    key: "militaryService",
    question: "Do you have any military service? (Optional — say 'skip' if not applicable)",
  },
  {
    key: "isStudent",
    question: "Are you a student? (Yes/No, optional — say 'skip' if not applicable)",
  },
];

export const FIELD_NAME_MAP: Record<string, keyof QuoteFormValues> = {
  "first name": "firstName",
  firstname: "firstName",
  "last name": "lastName",
  lastname: "lastName",
  "date of birth": "dateOfBirth",
  dob: "dateOfBirth",
  birthday: "dateOfBirth",
  "marital status": "maritalStatus",
  marital: "maritalStatus",
  gender: "gender",
  sex: "gender",
  "street address": "streetAddress",
  address: "streetAddress",
  state: "state",
  "zip code": "zipCode",
  zip: "zipCode",
  zipcode: "zipCode",
  "phone number": "phoneNumber",
  phone: "phoneNumber",
  cell: "phoneNumber",
  "text messages": "canReceiveTexts",
  "can receive texts": "canReceiveTexts",
  email: "emailAddress",
  "email address": "emailAddress",
  "driver license": "driverLicenseNumber",
  "license number": "driverLicenseNumber",
  "dl number": "driverLicenseNumber",
  ssn: "socialSecurityNumber",
  "social security": "socialSecurityNumber",
  "social security number": "socialSecurityNumber",
  "additional driver first name": "additionalDriverFirstName",
  "additional driver last name": "additionalDriverLastName",
  "additional driver dob": "additionalDriverDOB",
  "additional driver license": "additionalDriverLicense",
  vin: "vinNumber",
  "vin number": "vinNumber",
  "vehicle use": "vehicleUse",
  "use class": "vehicleUse",
  "primary use": "vehicleUse",
  "annual mileage": "estimatedAnnualMileage",
  mileage: "estimatedAnnualMileage",
  "drivers license number": "driverLicenseNumber",
  "driver's license": "driverLicenseNumber",
  "dl #": "driverLicenseNumber",
  "license #": "driverLicenseNumber",
  "garaging address": "streetAddress",
  "garage location": "streetAddress",
  "physical address": "streetAddress",
  "mailing address": "streetAddress",
  "insured mailing": "streetAddress",
  "policy mailing": "streetAddress",
  occupation: "occupation",
  military: "militaryService",
  "military service": "militaryService",
  student: "isStudent",
};

/** Two-letter US state/territory abbreviations → full name for form `state`. */
export const US_STATE_BY_ABBREV: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

export function normalizeUsStateForForm(raw: string): string {
  const v = raw.trim();
  if (!v) return v;
  const abbrev = v.length === 2 ? v.toUpperCase() : null;
  if (abbrev && US_STATE_BY_ABBREV[abbrev]) return US_STATE_BY_ABBREV[abbrev];
  const hit = US_STATES.find((s) => s.toLowerCase() === v.toLowerCase());
  return hit ?? v;
}

function normalizeDateSlashOrder(raw: string): string {
  const t = raw.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (iso) {
    const [, y, mo, d] = iso;
    return `${mo.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
  }
  const slash = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(t);
  if (slash) {
    let [, a, b, yRaw] = slash;
    let y = yRaw;
    if (y.length === 2) y = `20${y}`;
    return `${a.padStart(2, "0")}/${b.padStart(2, "0")}/${y}`;
  }
  return t;
}

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

const EXTRACTION_SELECT_OPTIONS: Partial<
  Record<keyof QuoteFormValues, readonly string[]>
> = {
  maritalStatus: ["Single", "Married", "Separated", "Divorced", "Widowed"],
  gender: ["Female", "Male", "Non-specified"],
  canReceiveTexts: ["Yes", "No"],
  vehicleUse: ["Commute to work or school", "Pleasure", "Business"],
  estimatedAnnualMileage: ["1-5K", "6-10K", "11-15K", "15K+"],
  isStudent: ["Yes", "No"],
};

function yesNoFromExtraction(lower: string): "Yes" | "No" | null {
  if (
    ["yes", "yeah", "yep", "yup", "y", "true", "1", "sure", "ok", "okay"].includes(
      lower,
    )
  ) {
    return "Yes";
  }
  if (["no", "nope", "nah", "n", "false", "0"].includes(lower)) {
    return "No";
  }
  return null;
}

function maritalStatusFromDecAbbrev(v: string): string | null {
  const t = v.trim().toUpperCase();
  if (t === "S") return "Single";
  if (t === "M") return "Married";
  if (t === "D") return "Divorced";
  if (t === "W") return "Widowed";
  if (t === "P" || t === "SEP") return "Separated";
  return null;
}

function genderFromDecAbbrev(v: string): string | null {
  const t = v.trim().toUpperCase();
  if (t === "F" || t === "FEM" || t === "FEMALE") return "Female";
  if (t === "M" || t === "MAL" || t === "MALE") return "Male";
  if (/\bnon[- ]?spec/i.test(v)) return "Non-specified";
  return null;
}

function vehicleUseFromDecText(lower: string): string | null {
  if (
    /\b(commute|commuting|tdw|to work|work or school|drive to work|school)\b/.test(
      lower,
    )
  ) {
    return "Commute to work or school";
  }
  if (/\b(pleasure|personal|private|pd)\b/.test(lower)) return "Pleasure";
  if (/\b(business|commercial|work vehicle)\b/.test(lower)) return "Business";
  return null;
}

function mileageBucketFromNumber(n: number): string | null {
  if (Number.isNaN(n) || n < 0) return null;
  if (n <= 5000) return "1-5K";
  if (n <= 10000) return "6-10K";
  if (n <= 15000) return "11-15K";
  return "15K+";
}

function mileageFromDecText(raw: string, lower: string): string | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length >= 4 && digits.length <= 6) {
    const n = parseInt(digits.slice(0, 6), 10);
    const b = mileageBucketFromNumber(n);
    if (b) return b;
  }
  if (/\b1[- ]?5\s*k\b/i.test(raw) || /\bunder\s*5/i.test(lower))
    return "1-5K";
  if (/\b6[- ]?10\s*k\b/i.test(raw) || /\b5[- ]?10\s*k\b/i.test(lower))
    return "6-10K";
  if (/\b11[- ]?15\s*k\b/i.test(raw)) return "11-15K";
  if (/\b15\s*k\+|\bhigh mileage|\bover\s*15/i.test(lower)) return "15K+";
  return null;
}

/** Map extracted text to exact select option strings the form expects. */
export function normalizeExtractedQuoteValue(
  key: keyof QuoteFormValues,
  raw: string,
): string {
  let v = raw.trim();
  if (v === "") return v;

  if (key === "state") {
    return normalizeUsStateForForm(v);
  }
  if (key === "zipCode") {
    const digits = v.replace(/\D/g, "");
    if (digits.length >= 9) return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
    if (digits.length === 5 || digits.length === 6) return digits;
    if (digits.length > 5) return digits.slice(0, 5);
    return v;
  }
  if (key === "dateOfBirth" || key === "additionalDriverDOB") {
    v = normalizeDateSlashOrder(v);
  }

  if (key === "maritalStatus") {
    const abbrev = maritalStatusFromDecAbbrev(v);
    if (abbrev) v = abbrev;
  }
  if (key === "gender") {
    const g = genderFromDecAbbrev(v);
    if (g) return g;
  }
  if (key === "vehicleUse") {
    const vu = vehicleUseFromDecText(v.toLowerCase());
    if (vu) return vu;
  }
  if (key === "estimatedAnnualMileage") {
    const m = mileageFromDecText(v, v.toLowerCase());
    if (m) return m;
  }

  const options = EXTRACTION_SELECT_OPTIONS[key];
  if (!options) return v;
  const lower = v.toLowerCase();
  if (options.includes("Yes") && options.includes("No")) {
    const yn = yesNoFromExtraction(lower);
    if (yn) return yn;
  }
  const exact = options.find((o) => o.toLowerCase() === lower);
  if (exact) return exact;
  const partial = options.find(
    (o) =>
      o.toLowerCase().startsWith(lower) || lower.startsWith(o.toLowerCase()),
  );
  return partial ?? v;
}
