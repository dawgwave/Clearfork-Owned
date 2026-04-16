import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerateContentResult,
  type ObjectSchema,
  type Schema,
} from "@google/generative-ai";
import mammoth from "mammoth";
import { NextRequest, NextResponse } from "next/server";
import { geminiModelCandidates } from "@/lib/gemini-models";
import {
  extractQuoteFieldsFromLabeledDocumentText,
  mergeModelUpdatesWithHeuristic,
} from "@/lib/quote-profile-line-parse";
import {
  FIELD_NAME_MAP,
  QUOTE_FIELD_LABELS,
  QUOTE_FORM_FIELD_KEYS,
  type QuoteFormValues,
  isQuoteFormFieldKey,
  normalizeExtractedQuoteValue,
} from "@/lib/quote-types";

const GEMINI_MODELS = geminiModelCandidates();

const MAX_FILE_BYTES = 25 * 1024 * 1024;
/** Gemini inlineData does not support Word; we extract text and send as a prompt. */
const MAX_DOCX_TEXT_CHARS = 400_000;

const REQUIRED_KEYS: (keyof QuoteFormValues)[] = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "maritalStatus",
  "gender",
  "streetAddress",
  "state",
  "zipCode",
  "phoneNumber",
  "emailAddress",
  "driverLicenseNumber",
];

/** CamelCase → snake_case for common model mistakes. */
function snakeFromCamel(key: string): string {
  return key
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

const SNAKE_TO_CAMEL: Record<string, keyof QuoteFormValues> = {};
for (const k of QUOTE_FORM_FIELD_KEYS) {
  SNAKE_TO_CAMEL[snakeFromCamel(k)] = k;
}
Object.assign(SNAKE_TO_CAMEL, {
  zip: "zipCode",
  zip_code: "zipCode",
  email: "emailAddress",
  phone: "phoneNumber",
  cell: "phoneNumber",
  drivers_license: "driverLicenseNumber",
  driver_license_number: "driverLicenseNumber",
  dl_number: "driverLicenseNumber",
  street_address: "streetAddress",
  date_of_birth: "dateOfBirth",
  first_name: "firstName",
  last_name: "lastName",
  marital_status: "maritalStatus",
  phone_number: "phoneNumber",
  email_address: "emailAddress",
  social_security_number: "socialSecurityNumber",
  additional_driver_first_name: "additionalDriverFirstName",
  additional_driver_last_name: "additionalDriverLastName",
  additional_driver_dob: "additionalDriverDOB",
  additional_driver_license: "additionalDriverLicense",
  vin: "vinNumber",
  vin_number: "vinNumber",
  vehicle_use: "vehicleUse",
  estimated_annual_mileage: "estimatedAnnualMileage",
  military_service: "militaryService",
});

function buildExtractionResponseSchema(): ObjectSchema {
  const updateProps: Record<string, Schema> = {};
  for (const k of QUOTE_FORM_FIELD_KEYS) {
    updateProps[k] = {
      type: SchemaType.STRING,
      nullable: true,
      description: QUOTE_FIELD_LABELS[k],
    };
  }
  return {
    type: SchemaType.OBJECT,
    properties: {
      reply: {
        type: SchemaType.STRING,
        description: "Short summary for the user about what was extracted",
      },
      missingFields: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description:
          "camelCase keys still missing after searching every section (including endorsements, driver rows beyond the first, vehicle blocks)",
      },
      updates: {
        type: SchemaType.OBJECT,
        properties: updateProps,
        description:
          "Populate every key you can find after reading the full document (declarations, drivers table, vehicles, addresses). Use null only when the field is nowhere in the document.",
      },
    },
    required: ["reply", "missingFields", "updates"],
    description: "Structured quote field extraction",
  };
}

const EXTRACTION_RESPONSE_SCHEMA = buildExtractionResponseSchema();

const UPLOAD_SYSTEM_PROMPT = `You are an expert at reading US auto insurance declarations pages, ID cards, and quote worksheets. Extract data for our quote form.

GOAL: Fill as many of the allowed form fields as possible. Scan the ENTIRE document: header, named insured, policy address, garaging/mailing address blocks, every driver row in tables, every vehicle, discounts, and notes.

LABELED PROFILE / INTAKE DOCUMENTS:
- Many Word files use one field per line like "First Name: Jane" or "Email Address: x@y.com". Parse EVERY such line and map to the matching form key. Do not skip lines because the layout looks informal.

NAMED INSURED / APPLICANT:
- Split the policyholder name into firstName and lastName (given name(s) → firstName, surname → lastName). If only "LAST, FIRST" format appears, parse accordingly.
- If "business" or "estate" is the only named insured and no person appears, still copy any shown contact address/phone if they match a person section elsewhere.

ADDRESSES:
- streetAddress = street line(s) only (house number + street, apt/unit if shown). Use garaging OR mailing address if labeled; prefer garaging for autos if both exist.
- state: expand 2-letter codes to full state names (TX → Texas).
- zipCode: digits only or ZIP+4.

DRIVERS (first row = primary unless labeled otherwise):
- dateOfBirth: normalize to MM/DD/YYYY when you can infer the date.
- maritalStatus / gender: map table codes (M/F, S/M/D/W) to the allowed enum strings.
- driverLicenseNumber from DL, license #, operator license columns.
- socialSecurityNumber only if explicitly printed (never invent digits).

ADDITIONAL DRIVER:
- If a second driver row exists, map to additionalDriverFirstName, additionalDriverLastName, additionalDriverDOB, additionalDriverLicense.

VEHICLES:
- vinNumber: 17-character VIN if present.
- vehicleUse: map "pleasure", "commute", "business", "farm", etc. to exactly one of: "Commute to work or school" | "Pleasure" | "Business".
- estimatedAnnualMileage: convert annual miles to one of: 1-5K | 6-10K | 11-15K | 15K+ (e.g. 12000 → 11-15K).

CONTACT:
- phoneNumber: include area code as printed.
- emailAddress if shown.
- canReceiveTexts: Yes/No if implied; otherwise omit.

OUTPUT JSON ONLY (no markdown), shape:
{
  "updates": { /* camelCase keys below; string values */ },
  "missingFields": [ /* camelCase keys still not found after full scan */ ],
  "reply": string (brief, friendly summary of what you filled)
}

Allowed keys:
${QUOTE_FORM_FIELD_KEYS.join(", ")}

Field labels for reference:
${QUOTE_FORM_FIELD_KEYS.map((k) => `${k}: ${QUOTE_FIELD_LABELS[k]}`).join("\n")}

ENUM strings (must match exactly when applicable):
- maritalStatus: Single | Married | Separated | Divorced | Widowed
- gender: Female | Male | Non-specified
- canReceiveTexts: Yes | No
- vehicleUse: Commute to work or school | Pleasure | Business
- estimatedAnnualMileage: 1-5K | 6-10K | 11-15K | 15K+
- isStudent: Yes | No

RULES:
- Be thorough: prefer including a value you read over leaving it blank.
- Omit a key from updates only if that fact truly does not appear anywhere.
- Do not fabricate SSN, driver license numbers, or VINs—only copy what is visible.
- If text came from a Word file pasted as plain text, tables may use "|" or line breaks—still extract rows.
- List every still-missing required-looking field in missingFields.`;

function resolveUpdateKey(rawKey: string): keyof QuoteFormValues | null {
  const k = rawKey.trim();
  if (isQuoteFormFieldKey(k)) return k;
  const snake = k.replace(/\s+/g, "_").toLowerCase();
  if (SNAKE_TO_CAMEL[snake]) return SNAKE_TO_CAMEL[snake];
  const labelKey = k.toLowerCase().trim();
  const fromMap = FIELD_NAME_MAP[labelKey];
  if (fromMap) return fromMap;
  return null;
}

function parseExtractionJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sanitizeUpdates(
  raw: unknown,
): Partial<Record<keyof QuoteFormValues, string>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Partial<Record<keyof QuoteFormValues, string>> = {};
  for (const [rawKey, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = resolveUpdateKey(rawKey);
    if (!key) continue;
    if (v === null || v === undefined) continue;
    const str = String(v).trim();
    if (str === "") continue;
    out[key] = normalizeExtractedQuoteValue(key, str);
  }
  return out;
}

/** Merge document extraction with existing form values (for required-field checks only). */
function effectiveValues(
  extracted: Partial<Record<keyof QuoteFormValues, string>>,
  known: Partial<Record<string, unknown>>,
): Partial<Record<keyof QuoteFormValues, string>> {
  const merged: Partial<Record<keyof QuoteFormValues, string>> = {};
  for (const key of QUOTE_FORM_FIELD_KEYS) {
    const fromDoc = extracted[key];
    if (fromDoc !== undefined && String(fromDoc).trim() !== "") {
      merged[key] = fromDoc;
      continue;
    }
    const cur = known[key];
    if (cur === null || cur === undefined) continue;
    const s = String(cur).trim();
    if (s !== "") merged[key] = normalizeExtractedQuoteValue(key, s);
  }
  return merged;
}

function inferMimeType(file: Blob & { name?: string }): string {
  const raw = file.type?.trim();
  if (raw && raw !== "application/octet-stream") return raw;
  const name = "name" in file && typeof file.name === "string" ? file.name : "";
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".doc")) return "application/msword";
  return "application/pdf";
}

function uploadDisplayName(file: Blob): string {
  return file instanceof File && typeof file.name === "string"
    ? file.name
    : "upload";
}

function isDocxUpload(mimeType: string, fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  );
}

function isLegacyWordDoc(mimeType: string, fileName: string): boolean {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) return false;
  return mimeType === "application/msword" || lower.endsWith(".doc");
}

/** Preserve table row/cell boundaries when Word is converted to HTML. */
function htmlRoughFromDocxHtml(html: string): string {
  return html
    .replace(/<\/(p|div|tr|table|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<td[^>]*>/gi, "\t")
    .replace(/<\/td>/gi, "\t|\t")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+\|[ \t]+/g, " | ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function docxBufferToModelAndRaw(buffer: Buffer): Promise<{
  modelText: string;
  rawPlain: string;
}> {
  const { value: raw } = await mammoth.extractRawText({ buffer });
  const rawTrim = raw.trim();
  let structured = "";
  try {
    const { value: html } = await mammoth.convertToHtml({ buffer });
    structured = htmlRoughFromDocxHtml(html);
  } catch (e) {
    console.warn("[quote-assistant/upload] docx→HTML failed, falling back:", e);
  }
  const structuredOk = structured.replace(/\s/g, "").length >= 40;
  let modelText: string;
  if (structuredOk && rawTrim.length >= 20) {
    modelText = `=== Structured (tables / blocks) ===\n${structured}\n\n=== Plain text ===\n${rawTrim}`;
  } else if (structuredOk) {
    modelText = structured;
  } else {
    modelText = rawTrim;
  }
  return { modelText, rawPlain: rawTrim };
}

/**
 * `response.text()` throws when a candidate is blocked or has no text parts.
 * Fall back to concatenating text parts or return empty so we can respond gracefully.
 */
function extractModelText(result: GenerateContentResult): string {
  const response = result.response;
  try {
    return response.text();
  } catch {
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    if (Array.isArray(parts)) {
      const chunks = parts
        .map((p: { text?: string }) =>
          typeof p.text === "string" ? p.text : "",
        )
        .filter(Boolean);
      if (chunks.length > 0) return chunks.join("\n");
    }
    const reason = response.promptFeedback?.blockReason;
    if (reason) {
      console.warn("[quote-assistant/upload] prompt blocked:", reason);
    }
    const finish = candidate?.finishReason;
    if (finish) {
      console.warn("[quote-assistant/upload] finishReason:", finish);
    }
    return "";
  }
}

function successPayload(
  parsed: Record<string, unknown> | null,
  fallbackText: string,
  knownForm: Partial<Record<string, unknown>>,
  labeledDocPlainText?: string,
): {
  updates: Partial<Record<keyof QuoteFormValues, string>>;
  missingFields: string[];
  reply: string;
} {
  const heuristic =
    labeledDocPlainText && labeledDocPlainText.length > 15
      ? extractQuoteFieldsFromLabeledDocumentText(labeledDocPlainText)
      : {};

  if (!parsed) {
    const updates =
      Object.keys(heuristic).length > 0
        ? heuristic
        : ({} as Partial<Record<keyof QuoteFormValues, string>>);
    const mergedForCheck = effectiveValues(updates, knownForm);
    const missingFields: string[] = [];
    for (const key of REQUIRED_KEYS) {
      const v = mergedForCheck[key];
      if (!v || String(v).trim() === "") missingFields.push(key);
    }
    return {
      updates,
      missingFields,
      reply:
        Object.keys(updates).length > 0
          ? "Filled fields from your document using labeled lines in the file."
          : fallbackText ||
            "Could not read structured data from the model. Try a clearer PDF or photo.",
    };
  }

  const modelUpdates = sanitizeUpdates(parsed.updates);
  const updates =
    Object.keys(heuristic).length > 0
      ? mergeModelUpdatesWithHeuristic(modelUpdates, heuristic)
      : modelUpdates;
  const mergedForCheck = effectiveValues(updates, knownForm);
  const rawMissing = parsed.missingFields;
  const missingFields: string[] = [];

  if (Array.isArray(rawMissing)) {
    for (const item of rawMissing) {
      if (typeof item !== "string") continue;
      const rk = resolveUpdateKey(item);
      if (rk && !missingFields.includes(rk)) missingFields.push(rk);
    }
  }

  for (const key of REQUIRED_KEYS) {
    const v = mergedForCheck[key];
    if (!v || String(v).trim() === "") {
      if (!missingFields.includes(key)) missingFields.push(key);
    }
  }

  const reply =
    typeof parsed.reply === "string"
      ? parsed.reply
      : "Here is what I could extract from your document.";

  return { updates, missingFields, reply };
}

async function runModelGenerate(
  genAI: GoogleGenerativeAI,
  modelName: string,
  parts: (
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  )[],
  useJsonSchema: boolean,
): Promise<GenerateContentResult> {
  if (useJsonSchema) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: UPLOAD_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_RESPONSE_SCHEMA,
        temperature: 0.28,
      },
    });
    return model.generateContent(parts);
  }
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: UPLOAD_SYSTEM_PROMPT,
    generationConfig: { temperature: 0.28 },
  });
  return model.generateContent(parts);
}

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[quote-assistant/upload] GEMINI_API_KEY not set");
      return NextResponse.json(
        { message: "AI not configured." },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: "Missing file." }, { status: 400 });
    }

    let knownForm: Partial<Record<string, unknown>> = {};
    const rawCurrent = formData.get("currentForm");
    if (typeof rawCurrent === "string" && rawCurrent.trim()) {
      try {
        knownForm = JSON.parse(rawCurrent) as Partial<Record<string, unknown>>;
      } catch {
        knownForm = {};
      }
    }

    const size = file.size;
    if (size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          message: `File too large (max ${MAX_FILE_BYTES / (1024 * 1024)} MB).`,
        },
        { status: 413 },
      );
    }

    const mimeType = inferMimeType(file as Blob & { name?: string });
    const buffer = Buffer.from(await file.arrayBuffer());
    const displayName = uploadDisplayName(file);

    const genAI = new GoogleGenerativeAI(apiKey);

    const prefillNote =
      Object.keys(knownForm).length > 0
        ? `\n\nIf the form already has values, prefer text from the document for any field you extract; keep existing form values only for fields not present in the document. Current form JSON:\n${JSON.stringify(knownForm)}`
        : "";

    let userParts: (
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    )[];

    if (isLegacyWordDoc(mimeType, displayName) && !isDocxUpload(mimeType, displayName)) {
      return NextResponse.json(
        {
          message:
            "Older Word .doc files are not supported for auto-fill. Please save as .docx or PDF and try again.",
        },
        { status: 400 },
      );
    }

    let docxPlainForHeuristic: string | undefined;

    if (isDocxUpload(mimeType, displayName)) {
      let documentText: string;
      try {
        const { modelText, rawPlain } = await docxBufferToModelAndRaw(buffer);
        documentText = modelText;
        docxPlainForHeuristic = rawPlain;
      } catch (e) {
        console.error("[quote-assistant/upload] docx extraction failed:", e);
        return NextResponse.json(
          {
            message:
              "Could not read that Word file. Try saving as PDF or re-exporting the document.",
          },
          { status: 400 },
        );
      }
      if (!documentText) {
        return NextResponse.json(
          {
            message:
              "No text found in that Word document. Try a PDF or a document with selectable text.",
          },
          { status: 400 },
        );
      }
      const clipped =
        documentText.length > MAX_DOCX_TEXT_CHARS
          ? `${documentText.slice(0, MAX_DOCX_TEXT_CHARS)}\n\n[... document truncated ...]`
          : documentText;
      userParts = [
        {
          text: `The following text was extracted from an uploaded Word document (${displayName}). Extract auto insurance quote form fields from it and respond with ONLY the JSON object required by your instructions.${prefillNote}\n\n---\n${clipped}\n---`,
        },
      ];
    } else {
      const base64 = buffer.toString("base64");
      userParts = [
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
        {
          text: `Extract quote form fields from this file. Return only the JSON object.${prefillNote}`,
        },
      ];
    }

    let lastError: unknown;
    let result: GenerateContentResult | null = null;
    let modelUsed = "";

    for (const modelName of GEMINI_MODELS) {
      try {
        result = await runModelGenerate(genAI, modelName, userParts, true);
        modelUsed = modelName;
        break;
      } catch (e) {
        lastError = e;
        console.warn(
          `[quote-assistant/upload] model ${modelName} (json schema) failed:`,
          e,
        );
        try {
          result = await runModelGenerate(genAI, modelName, userParts, false);
          modelUsed = modelName;
          break;
        } catch (e2) {
          lastError = e2;
          console.warn(
            `[quote-assistant/upload] model ${modelName} (plain) failed:`,
            e2,
          );
        }
      }
    }

    if (!result) {
      const msg =
        lastError instanceof Error ? lastError.message : "All models failed";
      console.error("[quote-assistant/upload] no model succeeded:", msg);
      return NextResponse.json(
        successPayload(
          null,
          `Could not analyze the file (${msg}). Try a PDF or PNG/JPG.`,
          knownForm,
          docxPlainForHeuristic,
        ),
      );
    }

    if (modelUsed && modelUsed !== GEMINI_MODELS[0]) {
      console.info("[quote-assistant/upload] used model:", modelUsed);
    }

    const text = extractModelText(result);
    const parsed = parseExtractionJson(text);
    const payload = successPayload(
      parsed,
      text,
      knownForm,
      docxPlainForHeuristic,
    );

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[quote-assistant/upload] error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      successPayload(null, `Something went wrong: ${msg}`, {}, undefined),
    );
  }
}
