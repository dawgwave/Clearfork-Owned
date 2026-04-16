"use client";

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
} from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Bot, Send, Upload, Loader2, CircleHelp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnimatedBotLogo } from "@/components/animated-bot-logo";
import {
  QuoteAssistantProvider,
  type QuoteAssistantContextType,
} from "./assistant-context";
import { DocumentProcessingBanner } from "./document-processing-banner";
import type { QuoteFormValues } from "@/lib/quote-types";
import {
  CONVERSATION_FLOW,
  FIELD_NAME_MAP,
  QUOTE_FIELD_LABELS,
  isQuoteFormFieldKey,
} from "@/lib/quote-types";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

export type QuoteAssistantHandle = {
  askQuestion: (q: string, d?: string) => void;
  openAssistant: () => void;
  handleMissingFields: (
    missingFields: string[],
    filledFields: string[],
  ) => void;
  showFieldHelp: (fieldLabel: string, helpText: string) => void;
};

interface AssistantModalProps {
  form: UseFormReturn<QuoteFormValues>;
  onSubmit?: () => void;
  onOpenChange?: (open: boolean) => void;
  /** Syncs with main quote page so the upload banner stays visible for assistant uploads */
  onDocumentProcessingChange?: (processing: boolean) => void;
}

const REQUIRED_FIELD_KEYS: Array<keyof QuoteFormValues> = [
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

const SELECT_OPTIONS: Partial<Record<keyof QuoteFormValues, string[]>> = {
  maritalStatus: ["Single", "Married", "Separated", "Divorced", "Widowed"],
  gender: ["Female", "Male", "Non-specified"],
  canReceiveTexts: ["Yes", "No"],
  vehicleUse: ["Commute to work or school", "Pleasure", "Business"],
  estimatedAnnualMileage: ["1-5K", "6-10K", "11-15K", "15K+"],
  isStudent: ["Yes", "No"],
};

const YES_VARIANTS = [
  "yes",
  "yeah",
  "yep",
  "yup",
  "sure",
  "y",
  "ok",
  "okay",
  "affirmative",
  "absolutely",
  "of course",
  "definitely",
];
const NO_VARIANTS = ["no", "nope", "nah", "n", "negative", "not really"];

function validateFieldValue(
  fieldKey: keyof QuoteFormValues,
  value: string,
): string | null {
  const v = value.trim();
  switch (fieldKey) {
    case "dateOfBirth":
    case "additionalDriverDOB":
      if (!/\d/.test(v) || /^[a-zA-Z\s]+$/.test(v))
        return "Please enter a valid date (MM/DD/YYYY).";
      return null;
    case "zipCode":
      if (!/^\d{3,9}$/.test(v.replace(/[-\s]/g, "")))
        return "Please enter a valid zip code (3-9 digits).";
      return null;
    case "phoneNumber":
      if (!/\d{7,}/.test(v.replace(/\D/g, "")))
        return "Please enter a valid phone number.";
      return null;
    case "emailAddress":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return "Please enter a valid email address.";
      return null;
    case "maritalStatus":
    case "gender":
    case "canReceiveTexts":
    case "vehicleUse":
    case "estimatedAnnualMileage":
    case "isStudent": {
      const options = SELECT_OPTIONS[fieldKey];
      if (!options) return null;
      const lower = v.toLowerCase();
      if (options.includes("Yes") && options.includes("No")) {
        if (YES_VARIANTS.includes(lower) || NO_VARIANTS.includes(lower))
          return null;
      }
      const match = options.find(
        (o) =>
          o.toLowerCase() === lower ||
          o.toLowerCase().startsWith(lower) ||
          lower.startsWith(o.toLowerCase()),
      );
      if (!match) return `Please choose one of: ${options.join(", ")}.`;
      return null;
    }
    default:
      if (/^[a-zA-Z\s]+$/.test(v) && v.split(/\s+/).length > 4) return null;
      return null;
  }
}

function cleanUserInput(raw: string): string {
  return raw
    .replace(
      /^(its|it is|it's|that is|that's|mine is|my|i'm|i am|i have|i live in|i stay in|i reside in|we live in)\s+/i,
      "",
    )
    .replace(/^(the\s+)?(answer|value)\s+(is|=)\s+/i, "")
    .trim();
}

function normalizeForSelect(
  fieldKey: keyof QuoteFormValues,
  rawValue: string,
): string {
  const options = SELECT_OPTIONS[fieldKey];
  if (!options) return rawValue;

  const lower = rawValue.toLowerCase().trim();

  if (options.includes("Yes") && options.includes("No")) {
    if (YES_VARIANTS.includes(lower)) return "Yes";
    if (NO_VARIANTS.includes(lower)) return "No";
  }

  const exact = options.find((o) => o.toLowerCase() === lower);
  if (exact) return exact;

  const partial = options.find(
    (o) =>
      o.toLowerCase().startsWith(lower) || lower.startsWith(o.toLowerCase()),
  );
  if (partial) return partial;

  return rawValue;
}

export const QuoteAssistantModal = forwardRef<
  QuoteAssistantHandle,
  AssistantModalProps
>(function QuoteAssistantModal(
  { form, onSubmit, onOpenChange, onDocumentProcessingChange },
  ref,
) {
  const [open, setOpenState] = useState(true);
  const setOpen = useCallback(
    (value: boolean) => {
      setOpenState(value);
      onOpenChange?.(value);
    },
    [onOpenChange],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chatMode, setChatMode] = useState<"form" | "ask">("form");
  const formMessagesRef = useRef<ChatMessage[]>([]);
  const askMessagesRef = useRef<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);
  const pendingFieldRef = useRef<keyof QuoteFormValues | null>(null);
  const skippedFieldsRef = useRef<Set<keyof QuoteFormValues>>(new Set());

  const extractFieldFromPattern = (
    rawInput: string,
  ): { field: keyof QuoteFormValues; value: string } | null => {
    const lowerInput = rawInput.toLowerCase().trim();
    const match = lowerInput.match(/^(.+?)\s+is\s+(.+)$/i);
    if (match) {
      const normalize = (name: string) =>
        name.replace(/^(the|my|a|an)\s+/i, "").trim();
      const fieldName = normalize(match[1]);
      const value = match[2].trim();
      const fieldKey = FIELD_NAME_MAP[fieldName];
      if (fieldKey) return { field: fieldKey, value };
      const sorted = Object.entries(FIELD_NAME_MAP).sort(
        (a, b) => b[0].length - a[0].length,
      );
      for (const [alias, key] of sorted) {
        const normalizedAlias = normalize(alias);
        if (
          normalizedAlias === fieldName ||
          normalizedAlias.includes(fieldName) ||
          fieldName.includes(normalizedAlias)
        ) {
          return { field: key, value };
        }
      }
    }
    return null;
  };

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const runAssistantSubmit = useCallback(() => {
    if (!onSubmit) return;
    appendMessage({ role: "bot", text: "Submitting your quote request..." });
    onSubmit();
    setTimeout(() => {
      appendMessage({
        role: "bot",
        text: "Your quote request has been submitted! We'll review your information and get back to you shortly.",
      });
    }, 400);
  }, [appendMessage, onSubmit]);

  const getMissingRequiredFields = (): Array<keyof QuoteFormValues> => {
    if (!form) return REQUIRED_FIELD_KEYS;
    try {
      const values = form.getValues();
      return REQUIRED_FIELD_KEYS.filter((key) => {
        if (skippedFieldsRef.current.has(key)) return false;
        const val = values[key];
        return val === "" || val === undefined || val === null;
      });
    } catch {
      return REQUIRED_FIELD_KEYS;
    }
  };

  const getNextEmptyField = (): keyof QuoteFormValues | undefined => {
    if (!form) return CONVERSATION_FLOW[0]?.key;
    try {
      const values = form.getValues();
      return CONVERSATION_FLOW.find(({ key }) => {
        if (skippedFieldsRef.current.has(key)) return false;
        const val = values[key];
        return val === "" || val === undefined || val === null;
      })?.key;
    } catch {
      return CONVERSATION_FLOW[0]?.key;
    }
  };

  const applyUpdates = (updates: Partial<QuoteFormValues>) => {
    if (!form) return;
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        form.setValue(key as keyof QuoteFormValues, value as string, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });
  };

  const askNextQuestion = () => {
    if (!form) return;
    const missingRequired = getMissingRequiredFields();
    if (missingRequired.length > 0) {
      const nextRequired = CONVERSATION_FLOW.find(({ key }) =>
        missingRequired.includes(key),
      );
      if (nextRequired) {
        pendingFieldRef.current = nextRequired.key;
        appendMessage({ role: "bot", text: nextRequired.question });
        return;
      }
    }
    const nextOptional = getNextEmptyField();
    if (nextOptional) {
      const fieldInfo = CONVERSATION_FLOW.find((f) => f.key === nextOptional);
      if (fieldInfo) {
        pendingFieldRef.current = fieldInfo.key;
        appendMessage({ role: "bot", text: fieldInfo.question });
        return;
      }
    }
    pendingFieldRef.current = null;
    appendMessage({
      role: "bot",
      text: "All fields are filled! Review the form and say 'submit' when you're ready.",
    });
  };

  const callGemini = useCallback(
    async (userText: string, isQuestion: boolean = false) => {
      if (!form) {
        appendMessage({
          role: "bot",
          text: "Form is not ready yet. Please wait a moment.",
        });
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch("/api/quote-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userText,
            currentForm: form.getValues(),
            pending: pendingFieldRef.current || getNextEmptyField(),
            isQuestion,
          }),
        });
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        const { updates = {}, submit = false, reply = "" } = data;

        if (!isQuestion && Object.keys(updates).length > 0) {
          applyUpdates(updates);
          const filledFields = Object.keys(updates)
            .map((k) => QUOTE_FIELD_LABELS[k as keyof QuoteFormValues] || k)
            .join(", ");
          appendMessage({
            role: "bot",
            text: reply || `Got it! I've filled in: ${filledFields}.`,
          });
          pendingFieldRef.current = null;
          if (!submit) setTimeout(() => askNextQuestion(), 400);
        } else if (reply) {
          appendMessage({ role: "bot", text: reply });
          if (!isQuestion && !submit) {
            pendingFieldRef.current = null;
            setTimeout(() => askNextQuestion(), 400);
          }
        }
        if (submit) {
          runAssistantSubmit();
        }
      } catch {
        appendMessage({
          role: "bot",
          text: "I encountered an error. Please try again or fill in the fields manually.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [form, appendMessage, runAssistantSubmit],
  );

  const handleDocumentUpload = async (file: File) => {
    setIsUploading(true);
    onDocumentProcessingChange?.(true);
    appendMessage({ role: "user", text: `Uploaded: ${file.name}` });
    appendMessage({ role: "bot", text: "Processing your document..." });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("currentForm", JSON.stringify(form.getValues()));
      const response = await fetch("/api/quote-assistant/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        updates?: Record<string, string>;
        reply?: string;
        missingFields?: string[];
        message?: string;
      };

      if (!response.ok) {
        const errText =
          typeof data.message === "string"
            ? data.message
            : typeof data.reply === "string"
              ? data.reply
              : `Upload failed (${response.status}). Try a PDF or DOCX.`;
        appendMessage({ role: "bot", text: errText });
        setTimeout(() => askNextQuestion(), 600);
        return;
      }

      const { updates = {}, reply = "" } = data;
      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([k]) => isQuoteFormFieldKey(k)),
      ) as Partial<QuoteFormValues>;
      const updateKeys = Object.keys(safeUpdates);

      if (updateKeys.length > 0) {
        applyUpdates(safeUpdates);
        const filledFields = updateKeys
          .map((k) => QUOTE_FIELD_LABELS[k as keyof QuoteFormValues] || k)
          .join(", ");
        appendMessage({
          role: "bot",
          text: reply || `I've extracted and filled in: ${filledFields}.`,
        });
      } else if (reply) {
        appendMessage({ role: "bot", text: reply });
      }

      const stillMissing = getMissingRequiredFields();
      if (stillMissing.length > 0) {
        const missingLabels = stillMissing
          .map((k) => QUOTE_FIELD_LABELS[k])
          .join(", ");
        appendMessage({
          role: "bot",
          text: `I still need the following required information: ${missingLabels}.\n\nLet me ask you about each one.`,
        });
        setTimeout(() => askNextQuestion(), 800);
      } else {
        appendMessage({
          role: "bot",
          text: "All required fields are filled! Review the form and say 'submit' when you're ready.",
        });
      }
    } catch {
      appendMessage({
        role: "bot",
        text: "I had trouble processing that document. Please try again.",
      });
    } finally {
      setIsUploading(false);
      onDocumentProcessingChange?.(false);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    appendMessage({ role: "user", text: trimmed });
    setInput("");
    const lower = trimmed.toLowerCase().trim();

    if (chatMode === "ask") {
      callGemini(trimmed, true);
      return;
    }

    if (lower === "submit" || lower === "send" || lower === "done") {
      const missing = getMissingRequiredFields();
      if (missing.length > 0) {
        const missingLabels = missing
          .map((k) => QUOTE_FIELD_LABELS[k])
          .join(", ");
        appendMessage({
          role: "bot",
          text: `Before I can submit, I still need: ${missingLabels}. Let me ask you about those.`,
        });
        setTimeout(() => askNextQuestion(), 500);
      } else {
        runAssistantSubmit();
      }
      return;
    }
    if (
      /^(help|support|contact|call|speak|talk|agent|human|representative|phone|assist me|need help)$/i.test(
        lower,
      ) ||
      /\b(help me|need assistance|talk to someone|speak to someone|contact.*agent|call.*someone)\b/i.test(
        lower,
      )
    ) {
      appendMessage({
        role: "bot",
        text: "Need to speak with someone? You can reach our team directly at (817) 249-8683. We're happy to help! You can also continue filling out the form here and we'll get back to you with a quote.",
      });
      return;
    }
    if (/\b(start|help|fill)\b.*\bform\b/i.test(trimmed) || lower === "form") {
      const missing = getMissingRequiredFields();
      if (missing.length > 0) {
        const missingLabels = missing
          .map((k) => QUOTE_FIELD_LABELS[k])
          .join(", ");
        appendMessage({
          role: "bot",
          text: `Let's fill out the missing required fields: ${missingLabels}.`,
        });
        setTimeout(() => askNextQuestion(), 500);
      } else {
        appendMessage({
          role: "bot",
          text: "All required fields are filled! Say 'submit' when ready.",
        });
      }
      return;
    }
    if (
      /^(hi|hello|hey|howdy|good morning|good afternoon|good evening|sup|what's up|yo|hola|greetings)[\s!.,]*$/i.test(
        lower,
      )
    ) {
      if (!pendingFieldRef.current) {
        appendMessage({
          role: "bot",
          text: "Hello! Welcome to Clearfork Insurance. I'm here to help you get a quote. Let's continue filling out your form.",
        });
        setTimeout(() => askNextQuestion(), 500);
      } else {
        const fieldInfo = CONVERSATION_FLOW.find(
          (f) => f.key === pendingFieldRef.current,
        );
        appendMessage({
          role: "bot",
          text: `Hello! Let's keep going with your quote. ${fieldInfo?.question || ""}`,
        });
      }
      return;
    }
    if (
      /^(thanks|thank you|thx|ty|appreciate it|cheers|thank u)[\s!.,]*$/i.test(
        lower,
      )
    ) {
      if (!pendingFieldRef.current) {
        appendMessage({
          role: "bot",
          text: "You're welcome! Let me continue with the next field.",
        });
        setTimeout(() => askNextQuestion(), 400);
      } else {
        const fieldInfo = CONVERSATION_FLOW.find(
          (f) => f.key === pendingFieldRef.current,
        );
        appendMessage({
          role: "bot",
          text: `You're welcome! Now, ${fieldInfo?.question?.toLowerCase() || "let's continue."}`,
        });
      }
      return;
    }
    if (/^(bye|goodbye|see you|later|gtg|gotta go|cya)[\s!.,]*$/i.test(lower)) {
      appendMessage({
        role: "bot",
        text: "Goodbye! If you'd like to finish your quote later, just come back anytime. We're here to help!",
      });
      return;
    }
    if (
      lower === "skip" ||
      lower === "none" ||
      lower === "n/a" ||
      lower === "i don't have" ||
      lower === "no"
    ) {
      if (pendingFieldRef.current) {
        const fieldLabel = QUOTE_FIELD_LABELS[pendingFieldRef.current];
        const isRequired = REQUIRED_FIELD_KEYS.includes(
          pendingFieldRef.current,
        );
        if (isRequired) {
          appendMessage({
            role: "bot",
            text: `${fieldLabel} is required and can't be skipped. Please provide a value.`,
          });
          return;
        }
        skippedFieldsRef.current.add(pendingFieldRef.current);
        appendMessage({ role: "bot", text: `Skipped ${fieldLabel}.` });
        pendingFieldRef.current = null;
        setTimeout(() => askNextQuestion(), 300);
        return;
      }
    }

    if (pendingFieldRef.current) {
      const fieldKey = pendingFieldRef.current;
      const fieldLabel = QUOTE_FIELD_LABELS[fieldKey];
      const cleaned = cleanUserInput(trimmed);
      const finalValue = normalizeForSelect(fieldKey, cleaned || trimmed);
      const validationError = validateFieldValue(fieldKey, finalValue);
      if (validationError) {
        appendMessage({
          role: "bot",
          text: `That doesn't look right for ${fieldLabel}. ${validationError}`,
        });
        return;
      }
      applyUpdates({ [fieldKey]: finalValue } as Partial<QuoteFormValues>);
      appendMessage({
        role: "bot",
        text: `Got it! I've set ${fieldLabel} to "${finalValue}".`,
      });
      pendingFieldRef.current = null;
      setTimeout(() => askNextQuestion(), 400);
      return;
    }

    const fieldPattern = extractFieldFromPattern(trimmed);
    if (fieldPattern) {
      applyUpdates({
        [fieldPattern.field]: fieldPattern.value,
      } as Partial<QuoteFormValues>);
      appendMessage({
        role: "bot",
        text: `Got it! I've filled in ${QUOTE_FIELD_LABELS[fieldPattern.field]}.`,
      });
      setTimeout(() => askNextQuestion(), 300);
      return;
    }
    callGemini(trimmed, false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      onOpenChange?.(true);
      appendMessage({
        role: "bot",
        text: 'Hi! I\'ll help you get a quote.\n\n\u2022 Answer my questions to fill the form\n\u2022 Upload your declarations page to auto-fill\n\u2022 Say "skip" for optional fields\n\u2022 Say "submit" when ready',
      });
      const firstEmpty = getNextEmptyField();
      if (firstEmpty) {
        const fieldInfo = CONVERSATION_FLOW.find((f) => f.key === firstEmpty);
        if (fieldInfo) {
          pendingFieldRef.current = firstEmpty;
          setTimeout(
            () => appendMessage({ role: "bot", text: fieldInfo.question }),
            800,
          );
        }
      }
    }
  }, []);

  const askQuestion = useCallback(
    (question: string, description?: string) => {
      if (!open) setOpen(true);
      appendMessage({ role: "user", text: question });
      if (description)
        setTimeout(
          () => appendMessage({ role: "bot", text: description }),
          300,
        );
      else setTimeout(() => callGemini(question, true), 300);
    },
    [open, appendMessage, callGemini],
  );

  const showFieldHelp = useCallback(
    (fieldLabel: string, helpText: string) => {
      setOpen(true);
      const body = helpText.trim();
      appendMessage({
        role: "bot",
        text: body ? `${fieldLabel}\n\n${body}` : fieldLabel,
      });
    },
    [setOpen, appendMessage],
  );

  const handleMissingFields = useCallback(
    (missingFields: string[], filledFields: string[]) => {
      if (!open) setOpen(true);
      if (filledFields.length > 0) {
        const filledLabels = filledFields
          .map((k) => QUOTE_FIELD_LABELS[k as keyof QuoteFormValues] || k)
          .join(", ");
        appendMessage({
          role: "bot",
          text: `I've extracted and filled in: ${filledLabels}.`,
        });
      }
      if (missingFields.length > 0) {
        const missingLabels = missingFields
          .map((k) => QUOTE_FIELD_LABELS[k as keyof QuoteFormValues] || k)
          .join(", ");
        appendMessage({
          role: "bot",
          text: `I still need the following required information: ${missingLabels}.\n\nLet me ask you about each one.`,
        });
        setTimeout(() => askNextQuestion(), 800);
      } else {
        appendMessage({
          role: "bot",
          text: "All required fields are filled! Review and say 'submit' when ready.",
        });
      }
    },
    [open, appendMessage],
  );

  const assistantContextValue: QuoteAssistantContextType = {
    askQuestion,
    openAssistant: () => setOpen(true),
    showFieldHelp,
  };

  useImperativeHandle(
    ref,
    () => ({
      askQuestion,
      openAssistant: () => setOpen(true),
      handleMissingFields,
      showFieldHelp,
    }),
    [askQuestion, handleMissingFields, showFieldHelp],
  );

  if (!open) {
    return (
      <QuoteAssistantProvider value={assistantContextValue}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[999] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open Quote Assistant"
        >
          <AnimatedBotLogo />
        </button>
      </QuoteAssistantProvider>
    );
  }

  return (
    <QuoteAssistantProvider value={assistantContextValue}>
      <aside className="fixed right-0 top-0 bottom-0 w-full md:w-[380px] z-50 bg-background border-l border-border flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-primary/20 flex-shrink-0 bg-primary/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-primary" />
              <span className="text-base font-semibold leading-none tracking-tight text-primary">
                Quote Assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity text-primary"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {isUploading && (
            <div
              className="sticky top-0 z-10 -mx-4 mb-1 px-4 pt-0 pb-2 bg-background/95 backdrop-blur-sm border-b border-border/60 shadow-sm"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <DocumentProcessingBanner />
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[85%] text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && !isUploading && (
            <div className="flex items-start">
              <div className="bg-muted text-foreground rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom controls */}
        <div className="border-t border-border px-4 py-3 flex-shrink-0 space-y-2">
          {/* Upload */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDocumentUpload(file);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className="text-xs gap-1.5"
            >
              <Upload size={14} />
              Upload Document
            </Button>
            <span className="text-xs text-muted-foreground">PDF or DOCX</span>
            <button
              onClick={() => {
                if (chatMode === "form") {
                  formMessagesRef.current = [...messages];
                  const saved = askMessagesRef.current;
                  if (saved.length > 0) {
                    setMessages(saved);
                  } else {
                    setMessages([
                      {
                        role: "bot",
                        text: 'Ask mode on.\n\n\u2022 Ask about our insurance services or coverage\n\u2022 Get company contact info or office details\n\u2022 Ask any general insurance questions\n\nTap "Ask Mode" again to go back to form filling.',
                      },
                    ]);
                  }
                  setChatMode("ask");
                } else {
                  askMessagesRef.current = [...messages];
                  setMessages(formMessagesRef.current);
                  setChatMode("form");
                  const pendingKey = pendingFieldRef.current;
                  const pendingAlreadyFilled = pendingKey
                    ? Boolean(form.getValues(pendingKey))
                    : true;
                  if (!pendingKey || pendingAlreadyFilled) {
                    setTimeout(() => askNextQuestion(), 400);
                  }
                }
              }}
              className={cn(
                "ml-auto text-xs px-2.5 py-1 rounded-full font-medium transition-all border",
                chatMode === "ask"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary",
              )}
            >
              Ask Mode
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="What is Ask Mode?"
                >
                  <CircleHelp size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                Use Ask Mode for general insurance questions.
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                chatMode === "form"
                  ? "Type your answer..."
                  : "Ask me anything about insurance..."
              }
              disabled={isLoading || isUploading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || isUploading || !input.trim()}
              size="icon"
            >
              <Send size={18} />
            </Button>
          </div>

          <a
            href="https://getstarfish.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center gap-2 pb-1 hover:opacity-80 transition-opacity"
          >
            <span className="text-xs text-muted-foreground">Powered by</span>
            <img
              src="/getStarfish.svg"
              alt="Starfish"
              className="h-12 w-auto"
            />
          </a>
        </div>
      </aside>
    </QuoteAssistantProvider>
  );
});
