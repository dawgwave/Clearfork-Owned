import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { geminiModelCandidates } from "@/lib/gemini-models";
import {
  CONVERSATION_FLOW,
  QUOTE_FIELD_LABELS,
  type QuoteFormValues,
  quoteFormSchema,
} from "@/lib/quote-types";

const STARFISH_AGENT_URL =
  process.env.STARFISH_AGENT_URL ??
  "https://umesyaxnkvnpnyhvcopy.supabase.co/functions/v1/starfish-agent";

const QUOTE_KEYS = quoteFormSchema.keyof().options;

function isQuoteFieldKey(k: string): k is keyof QuoteFormValues {
  return (QUOTE_KEYS as readonly string[]).includes(k);
}

function parseAssistantJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sanitizeUpdates(raw: unknown): Partial<Record<keyof QuoteFormValues, string>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Partial<Record<keyof QuoteFormValues, string>> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!isQuoteFieldKey(k)) continue;
    if (v === null || v === undefined) continue;
    out[k] = String(v);
  }
  return out;
}

const FORM_FILL_SYSTEM_PROMPT = `You are an assistant helping a user complete an auto insurance quote form for Clearfork Insurance.

You must respond with ONLY valid JSON (no markdown fences), using this exact shape:
{
  "reply": string (conversational message to the user),
  "updates": object (optional) — only keys from the allowed field list; string values only,
  "completed": boolean (true if every required field has a non-empty value after applying updates),
  "submit": boolean (true only if the user clearly wants to submit and all required fields are filled)
}

Allowed field keys (camelCase only):
${QUOTE_KEYS.join(", ")}

Field labels for context:
${QUOTE_KEYS.map((k) => `${k}: ${QUOTE_FIELD_LABELS[k]}`).join("\n")}

Required fields (must be non-empty strings for completed=true): firstName, lastName, dateOfBirth, maritalStatus, gender, streetAddress, state, zipCode, phoneNumber, emailAddress, driverLicenseNumber.

Optional fields: canReceiveTexts, socialSecurityNumber, additionalDriverFirstName, additionalDriverLastName, additionalDriverDOB, additionalDriverLicense, vinNumber, vehicleUse, estimatedAnnualMileage, occupation, militaryService, isStudent.

Rules:
- Infer updates from the user's latest message; merge logically with current form state mentally.
- Use empty string in updates only to clear optional fields if user says skip.
- If the user asks a general insurance question unrelated to the form, still return JSON with reply answering briefly and updates {} if nothing to fill.
- Never invent sensitive numbers; if unsure, ask in reply and omit that key from updates.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      user?: string;
      currentForm?: Partial<QuoteFormValues>;
      pending?: unknown;
      isQuestion?: boolean;
    };

    const userMessage = typeof body.user === "string" ? body.user : "";
    const currentForm = (body.currentForm ?? {}) as Partial<QuoteFormValues>;

    if (body.isQuestion) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        accept: "application/json",
      };
      const bearer = process.env.STARFISH_AGENT_TOKEN ?? process.env.SUPABASE_ANON_KEY;
      if (bearer) {
        headers.Authorization = `Bearer ${bearer}`;
      }

      const starfishRes = await fetch(STARFISH_AGENT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user: userMessage,
          currentForm,
          pending: body.pending,
          isQuestion: true,
        }),
      });

      const starfishText = await starfishRes.text();
      let starfishData: unknown;
      try {
        starfishData = JSON.parse(starfishText) as unknown;
      } catch {
        starfishData = { reply: starfishText };
      }

      if (!starfishRes.ok) {
        console.error("[quote-assistant] Starfish agent error:", starfishRes.status, starfishText);
        return NextResponse.json(
          {
            reply: "Sorry, I could not reach the assistant. Please try again.",
            updates: {},
            completed: false,
            submit: false,
          },
          { status: 200 },
        );
      }

      if (starfishData && typeof starfishData === "object" && "reply" in starfishData) {
        return NextResponse.json(starfishData);
      }

      return NextResponse.json({
        reply: typeof starfishData === "string" ? starfishData : starfishText,
        updates: {},
        completed: false,
        submit: false,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[quote-assistant] GEMINI_API_KEY not set");
      return NextResponse.json({ message: "AI not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const userPayload = `Current form state (JSON):\n${JSON.stringify(currentForm, null, 2)}\n\nConversation order hint:\n${CONVERSATION_FLOW.map((s) => `${s.key}: ${s.question}`).join("\n")}\n\nUser message:\n${userMessage}`;

    let text = "";
    let lastGeminiError: unknown;
    for (const modelName of geminiModelCandidates()) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          systemInstruction: FORM_FILL_SYSTEM_PROMPT,
          contents: [{ role: "user", parts: [{ text: userPayload }] }],
        });
        text = result.response.text();
        break;
      } catch (e) {
        lastGeminiError = e;
        console.warn(`[quote-assistant] model ${modelName} failed:`, e);
      }
    }

    if (!text) {
      console.error("[quote-assistant] all Gemini models failed:", lastGeminiError);
      return NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
    const parsed = parseAssistantJson(text);

    if (!parsed) {
      return NextResponse.json({
        reply: text || "I could not parse that. Could you rephrase?",
        updates: {},
        completed: false,
        submit: false,
      });
    }

    const updates = sanitizeUpdates(parsed.updates);
    const reply = typeof parsed.reply === "string" ? parsed.reply : "";
    const completed = Boolean(parsed.completed);
    const submit = Boolean(parsed.submit);

    return NextResponse.json({ reply, updates, completed, submit });
  } catch (error) {
    console.error("[quote-assistant] error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
