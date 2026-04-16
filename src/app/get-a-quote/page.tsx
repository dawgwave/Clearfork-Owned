"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  QuoteAssistantModal,
  type QuoteAssistantHandle,
} from "@/components/quote-assistant/assistant-modal";
import { DocumentProcessingBanner } from "@/components/quote-assistant/document-processing-banner";
import {
  quoteFormSchema,
  defaultQuoteValues,
  type QuoteFormValues,
  isQuoteFormFieldKey,
  QUOTE_FIELD_LABELS,
} from "@/lib/quote-types";
import { isAllowedQuoteUploadFile } from "@/lib/quote-upload";
import { cn } from "@/lib/utils";

export default function GetAQuotePage() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stateOptionsOpen, setStateOptionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateFieldRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const [panelOpen, setPanelOpen] = useState(true);
  /** Avoid hydration mismatch: extensions (e.g. autofill) inject attrs like fdprocessedid before React hydrates. */
  const [clientReady, setClientReady] = useState(false);
  const assistantRef = useRef<QuoteAssistantHandle | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: defaultQuoteValues,
    mode: "onBlur",
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const US_STATES = [
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
  ];
  const stateValue = watch("state") || "";
  const filteredStates = US_STATES.filter((stateName) =>
    stateName.toLowerCase().includes(stateValue.toLowerCase()),
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        stateFieldRef.current &&
        !stateFieldRef.current.contains(event.target as Node)
      ) {
        setStateOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    const el = document.getElementById("quote-hero");
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  useEffect(() => {
    if (!isUploading) return;
    const banner = document.getElementById("quote-upload-banner");
    banner?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isUploading]);

  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.types.includes("Files")) {
        setDragActive(true);
      }
    };
    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setDragActive(false);
      }
    };
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  const processFile = async (file: File) => {
    if (!isAllowedQuoteUploadFile(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.doc, .docx).",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

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
        setUploadedFile(null);
        toast({
          title: "Upload failed",
          description:
            typeof data.message === "string"
              ? data.message
              : typeof data.reply === "string"
                ? data.reply
                : `Something went wrong (${response.status}).`,
          variant: "destructive",
        });
        return;
      }

      const filledFields: string[] = [];
      if (data.updates && typeof data.updates === "object") {
        Object.entries(data.updates).forEach(([key, value]) => {
          if (!isQuoteFormFieldKey(key)) return;
          if (value) {
            setValue(key, value as string, {
              shouldValidate: true,
              shouldDirty: true,
            });
            filledFields.push(key);
          }
        });
      }

      toast({
        title: "Document processed",
        description:
          data.reply || "Information has been extracted and filled in.",
      });

      const missingFields: string[] = Array.isArray(data.missingFields)
        ? data.missingFields
        : [];
      assistantRef.current?.handleMissingFields(missingFields, filledFields);
    } catch {
      setUploadedFile(null);
      toast({
        title: "Upload failed",
        description: "Could not process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true);
    try {
      let recaptchaToken: string | undefined;
      const win = window as unknown as {
        grecaptcha?: {
          execute: (key: string, opts: { action: string }) => Promise<string>;
        };
      };
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (win.grecaptcha && siteKey) {
        recaptchaToken = await win.grecaptcha.execute(siteKey, {
          action: "quote_submit",
        });
      }

      const response = await fetch("/api/quote-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      if (!response.ok) throw new Error("Submit failed");

      toast({
        title: "Quote request submitted!",
        description:
          "We'll review your information and get back to you shortly.",
      });
      form.reset(defaultQuoteValues);
      setUploadedFile(null);
    } catch {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssistantSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const fieldTooltips: Partial<Record<keyof QuoteFormValues, string>> = {
    firstName: "Your legal first name as it appears on your driver's license.",
    lastName: "Your legal last name as it appears on your driver's license.",
    dateOfBirth:
      "Enter in MM/DD/YYYY format. Used to determine age-based rates.",
    maritalStatus:
      "Married drivers often qualify for lower insurance premiums.",
    gender: "Some states use gender as a rating factor for auto insurance.",
    emailAddress: "We'll send your quote details and policy documents here.",
    streetAddress:
      "Your primary residence address where the vehicle is garaged.",
    state: "The state where your vehicle is primarily driven and registered.",
    zipCode: "Your ZIP code helps determine local risk factors and rates.",
    phoneNumber: "We may call to discuss your quote or clarify details.",
    canReceiveTexts:
      "Allows us to send quick updates about your quote via text.",
    driverLicenseNumber:
      "Found on your driver's license. Required for accurate quoting.",
    socialSecurityNumber:
      "Optional. May help us pull your driving record for better rates.",
    vinNumber:
      "17-character Vehicle Identification Number, found on your dashboard or door jamb.",
    vehicleUse: "How the vehicle is primarily used affects your premium.",
    estimatedAnnualMileage: "Lower mileage can qualify you for reduced rates.",
    additionalDriverFirstName:
      "Legal first name of any additional driver on the policy.",
    additionalDriverLastName:
      "Legal last name of any additional driver on the policy.",
    additionalDriverDOB:
      "Date of birth for the additional driver in MM/DD/YYYY format.",
    additionalDriverLicense:
      "Driver's license number of the additional driver.",
    occupation: "Certain professions may qualify for insurance discounts.",
    militaryService:
      "Active or veteran military members may receive special discounts.",
    isStudent: "Full-time students with good grades may qualify for discounts.",
  };

  const renderInfoIcon = (name: keyof QuoteFormValues) => {
    const tip = fieldTooltips[name];
    if (!tip) return null;
    const fieldLabel = QUOTE_FIELD_LABELS[name];
    return (
      <button
        type="button"
        className="inline-flex shrink-0 ml-1 rounded-sm text-muted-foreground hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Field help: ${fieldLabel}, click to ask the agent`}
        onClick={() => {
          assistantRef.current?.showFieldHelp(fieldLabel, tip);
        }}
      >
        <Info size={14} className="pointer-events-none" aria-hidden />
      </button>
    );
  };

  const renderField = (
    name: keyof QuoteFormValues,
    label: string,
    options?: { type?: string; placeholder?: string; required?: boolean },
  ) => {
    const { type = "text", placeholder, required = false } = options || {};
    const error = errors[name];
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium flex items-center">
          {label} {required && <span className="text-red-500">*</span>}
          {renderInfoIcon(name)}
        </Label>
        <Input
          id={name}
          type={type}
          placeholder={placeholder || label}
          className={cn(error && "border-red-500 focus-visible:ring-red-500")}
          {...register(name)}
        />
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {error.message}
          </p>
        )}
      </div>
    );
  };

  const renderSelect = (
    name: keyof QuoteFormValues,
    label: string,
    items: string[],
    options?: { required?: boolean },
  ) => {
    const { required = false } = options || {};
    const error = errors[name];
    const currentValue = watch(name);
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium flex items-center">
          {label} {required && <span className="text-red-500">*</span>}
          {renderInfoIcon(name)}
        </Label>
        <Select
          value={currentValue || ""}
          onValueChange={(val) =>
            setValue(name, val, { shouldValidate: true, shouldDirty: true })
          }
        >
          <SelectTrigger className={cn(error && "border-red-500")}>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {error.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "min-h-screen bg-background relative transition-[padding] duration-300",
          clientReady && panelOpen && "md:pr-[380px]",
        )}
      >
        {/* Full-page drag overlay */}
        {dragActive && (
          <div className="fixed inset-0 z-[100] bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="mx-4 max-w-lg rounded-2xl border-2 border-dashed border-primary bg-white p-12 text-center shadow-2xl">
              <div className="bg-primary/10 p-5 rounded-full inline-flex mb-5">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                Drop your document here
              </p>
              <p className="text-muted-foreground">
                PDF or DOCX — we'll extract the info and auto-fill the form
              </p>
            </div>
          </div>
        )}

        {/* Hero — static; safe to SSR so SEO and layout stay stable */}
        <section
          id="quote-hero"
          className="bg-gradient-to-br from-primary/10 to-primary/5 py-16"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get Your Free Auto Insurance Quote
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Fill out the form below or upload your current declarations page
                and our AI assistant will extract the information for you. It's
                fast, easy, and secure.
              </p>
            </div>
          </div>
        </section>

        {!clientReady ? (
          <section
            className="py-12"
            aria-busy="true"
            aria-label="Loading quote form"
          >
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-28 rounded-xl bg-muted/80 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-8 w-48 rounded-md bg-muted/80 animate-pulse" />
                  <div className="grid md:grid-cols-2 gap-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 rounded-md bg-muted/80 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Main Content */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  {/* Upload status bar */}
                  <div
                    id="quote-upload-banner"
                    className="mb-10 scroll-mt-24"
                    role={isUploading ? "status" : undefined}
                    aria-busy={isUploading ? true : undefined}
                    aria-live={isUploading ? "polite" : undefined}
                  >
                    {isUploading ? (
                      <DocumentProcessingBanner />
                    ) : uploadedFile ? (
                      <div className="rounded-xl border-2 border-primary bg-gradient-to-r from-primary/[0.2] via-primary/[0.06] to-primary/[0.14] ring-2 ring-primary/45 shadow-lg shadow-primary/20 p-5 transition-colors">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {uploadedFile.name}
                                </span>
                                <button
                                  onClick={() => setUploadedFile(null)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <p className="text-xs text-green-600 mt-0.5">
                                Document processed — form fields updated
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Upload different file
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-primary bg-gradient-to-r from-primary/[0.2] via-primary/[0.06] to-primary/[0.14] ring-2 ring-primary/45 shadow-lg shadow-primary/20 p-5 transition-colors flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Have a declarations page? Drag & drop it anywhere
                              on this page
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF or DOCX — we'll extract the info and auto-fill
                              the form for you
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-primary/80 text-primary bg-primary/[0.12] hover:bg-primary/20 hover:border-primary shadow-md focus-visible:ring-primary/50 font-medium"
                        >
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Form */}
                  <FormProvider {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-10"
                    >
                      {/* Personal Information */}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          Personal Information
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          Required fields are marked with *
                        </p>
                        <div className="grid md:grid-cols-2 gap-5">
                          {renderField("firstName", "First Name", {
                            required: true,
                            placeholder: "John",
                          })}
                          {renderField("lastName", "Last Name", {
                            required: true,
                            placeholder: "Doe",
                          })}
                          {renderField("dateOfBirth", "Date of Birth", {
                            required: true,
                            placeholder: "MM/DD/YYYY",
                          })}
                          {renderSelect(
                            "maritalStatus",
                            "Marital Status",
                            [
                              "Single",
                              "Married",
                              "Separated",
                              "Divorced",
                              "Widowed",
                            ],
                            { required: true },
                          )}
                          {renderSelect(
                            "gender",
                            "Gender",
                            ["Female", "Male", "Non-specified"],
                            { required: true },
                          )}
                          {renderField("emailAddress", "Email Address", {
                            type: "email",
                            required: true,
                            placeholder: "john@example.com",
                          })}
                        </div>
                      </div>

                      {/* Contact & Address */}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                          Contact & Address
                        </h2>
                        <div className="grid md:grid-cols-2 gap-5">
                          {renderField("streetAddress", "Street Address", {
                            required: true,
                            placeholder: "123 Main St",
                          })}
                          <div className="space-y-2" ref={stateFieldRef}>
                            <Label
                              htmlFor="state"
                              className="text-sm font-medium flex items-center"
                            >
                              State <span className="text-red-500">*</span>
                              {renderInfoIcon("state")}
                            </Label>
                            <div className="relative">
                              <Input
                                id="state"
                                autoComplete="off"
                                placeholder="Type state (e.g. Texas)"
                                value={stateValue}
                                onFocus={() => setStateOptionsOpen(true)}
                                onChange={(e) => {
                                  setValue("state", e.target.value, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  setStateOptionsOpen(true);
                                }}
                                className={cn(
                                  "pr-10",
                                  errors.state &&
                                    "border-red-500 focus-visible:ring-red-500",
                                )}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setStateOptionsOpen((prev) => !prev)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Toggle states list"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>

                              {stateOptionsOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-60 overflow-y-auto rounded-md border border-border bg-white shadow-lg">
                                  {filteredStates.length > 0 ? (
                                    filteredStates.map((stateName) => (
                                      <button
                                        key={stateName}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                          setValue("state", stateName, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          });
                                          setStateOptionsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                      >
                                        {stateName}
                                      </button>
                                    ))
                                  ) : (
                                    <p className="px-3 py-2 text-sm text-muted-foreground">
                                      No matching state found
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {errors.state && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.state.message}
                              </p>
                            )}
                          </div>
                          {renderField("zipCode", "Zip Code", {
                            required: true,
                            placeholder: "76109",
                          })}
                          {renderField("phoneNumber", "Phone Number", {
                            required: true,
                            placeholder: "(817) 555-0123",
                          })}
                          {renderSelect(
                            "canReceiveTexts",
                            "Can You Receive Texts?",
                            ["Yes", "No"],
                          )}
                        </div>
                      </div>

                      {/* Driver & Vehicle Information */}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                          Driver & Vehicle Information
                        </h2>
                        <div className="grid md:grid-cols-2 gap-5">
                          {renderField(
                            "driverLicenseNumber",
                            "Driver License Number",
                            { required: true },
                          )}
                          {renderField(
                            "socialSecurityNumber",
                            "Social Security Number",
                            { placeholder: "Optional" },
                          )}
                          {renderField("vinNumber", "VIN Number", {
                            placeholder: "Vehicle Identification Number",
                          })}
                          {renderSelect("vehicleUse", "Vehicle Use", [
                            "Commute to work or school",
                            "Pleasure",
                            "Business",
                          ])}
                          {renderSelect(
                            "estimatedAnnualMileage",
                            "Estimated Annual Mileage",
                            ["1-5K", "6-10K", "11-15K", "15K+"],
                          )}
                        </div>
                      </div>

                      {/* Additional Driver */}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          Additional Driver
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          If applicable, add details for additional drivers on
                          the policy.
                        </p>
                        <div className="grid md:grid-cols-2 gap-5">
                          {renderField(
                            "additionalDriverFirstName",
                            "First Name",
                            {
                              placeholder: "Optional",
                            },
                          )}
                          {renderField(
                            "additionalDriverLastName",
                            "Last Name",
                            {
                              placeholder: "Optional",
                            },
                          )}
                          {renderField("additionalDriverDOB", "Date of Birth", {
                            placeholder: "MM/DD/YYYY",
                          })}
                          {renderField(
                            "additionalDriverLicense",
                            "Driver License Number",
                            { placeholder: "Optional" },
                          )}
                        </div>
                      </div>

                      {/* Discount Information */}
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          Discount Information
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          Optional — may help us find you better rates.
                        </p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {renderField("occupation", "Occupation", {
                            placeholder: "Your occupation",
                          })}
                          {renderField("militaryService", "Military Service", {
                            placeholder: "Branch",
                          })}
                          {renderSelect("isStudent", "Are You a Student?", [
                            "Yes",
                            "No",
                          ])}
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-4 border-t">
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="w-full md:w-auto px-12 py-6 text-lg"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : "Submit Quote Request"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                          Your information is secure and will only be used to
                          provide your quote. This site is protected by
                          reCAPTCHA and the Google{" "}
                          <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Privacy Policy
                          </a>{" "}
                          and{" "}
                          <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Terms of Service
                          </a>{" "}
                          apply.
                        </p>
                      </div>
                    </form>
                  </FormProvider>
                </div>
              </div>
            </section>

            {/* AI Assistant */}
            <QuoteAssistantModal
              ref={assistantRef}
              form={form}
              onSubmit={handleAssistantSubmit}
              onOpenChange={setPanelOpen}
              onDocumentProcessingChange={setIsUploading}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
