import { useState, useRef, useCallback, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { QuoteAssistantModal } from "@/components/quote-assistant/assistant-modal";
import {
  quoteFormSchema,
  defaultQuoteValues,
  type QuoteFormValues,
} from "@/lib/quote-types";
import { cn } from "@/lib/utils";

export default function GetAQuote() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const assistantRef = useRef<{ askQuestion: (q: string, d?: string) => void; openAssistant: () => void; handleMissingFields: (missingFields: string[], filledFields: string[]) => void } | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: defaultQuoteValues,
    mode: "onBlur",
  });

  const { register, setValue, watch, formState: { errors } } = form;

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
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
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

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();

      const filledFields: string[] = [];
      if (data.updates && typeof data.updates === "object") {
        Object.entries(data.updates).forEach(([key, value]) => {
          if (value) {
            setValue(key as keyof QuoteFormValues, value as string, {
              shouldValidate: true,
              shouldDirty: true,
            });
            filledFields.push(key);
          }
        });
      }

      toast({
        title: "Document processed",
        description: data.reply || "Information has been extracted and filled in.",
      });

      const missingFields: string[] = data.missingFields || [];
      assistantRef.current?.handleMissingFields(missingFields, filledFields);
    } catch {
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
      const response = await fetch("/api/quote-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Submit failed");

      toast({
        title: "Quote request submitted!",
        description: "We'll review your information and get back to you shortly.",
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
    dateOfBirth: "Enter in MM/DD/YYYY format. Used to determine age-based rates.",
    maritalStatus: "Married drivers often qualify for lower insurance premiums.",
    gender: "Some states use gender as a rating factor for auto insurance.",
    emailAddress: "We'll send your quote details and policy documents here.",
    streetAddress: "Your primary residence address where the vehicle is garaged.",
    state: "The state where your vehicle is primarily driven and registered.",
    zipCode: "Your ZIP code helps determine local risk factors and rates.",
    phoneNumber: "We may call to discuss your quote or clarify details.",
    canReceiveTexts: "Allows us to send quick updates about your quote via text.",
    driverLicenseNumber: "Found on your driver's license. Required for accurate quoting.",
    socialSecurityNumber: "Optional. May help us pull your driving record for better rates.",
    vinNumber: "17-character Vehicle Identification Number, found on your dashboard or door jamb.",
    vehicleUse: "How the vehicle is primarily used affects your premium.",
    estimatedAnnualMileage: "Lower mileage can qualify you for reduced rates.",
    additionalDriverFirstName: "Legal first name of any additional driver on the policy.",
    additionalDriverLastName: "Legal last name of any additional driver on the policy.",
    additionalDriverDOB: "Date of birth for the additional driver in MM/DD/YYYY format.",
    additionalDriverLicense: "Driver's license number of the additional driver.",
    occupation: "Certain professions may qualify for insurance discounts.",
    militaryService: "Active or veteran military members may receive special discounts.",
    isStudent: "Full-time students with good grades may qualify for discounts.",
  };

  const renderInfoIcon = (name: keyof QuoteFormValues) => {
    const tip = fieldTooltips[name];
    if (!tip) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Info size={14} className="text-muted-foreground hover:text-primary cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-xs">
          {tip}
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderField = (
    name: keyof QuoteFormValues,
    label: string,
    options?: { type?: string; placeholder?: string; required?: boolean }
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
    options?: { required?: boolean }
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
          onValueChange={(val) => setValue(name, val, { shouldValidate: true, shouldDirty: true })}
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
    <div className={cn("min-h-screen bg-background relative transition-[padding] duration-300", panelOpen && "md:pr-[380px]")}>
      {/* Full-page drag overlay */}
      {dragActive && (
        <div className="fixed inset-0 z-[100] bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-dashed border-primary p-12 text-center max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        className="hidden"
        onChange={handleFileInput}
      />

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get Your Free Auto Insurance Quote
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Fill out the form below or upload your current declarations page and our AI assistant
              will extract the information for you. It's fast, easy, and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Upload status bar */}
            <div className="rounded-xl border bg-gray-50 p-5 mb-10">
              {isUploading ? (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Processing document...</p>
                    <p className="text-xs text-muted-foreground">Extracting information and filling the form</p>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-0.5">Document processed — form fields updated</p>
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
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Have a declarations page? Drag & drop it anywhere on this page
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF or DOCX — we'll extract the info and auto-fill the form for you
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Form */}
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                {/* Personal Information */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Personal Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">Required fields are marked with *</p>
                  <div className="grid md:grid-cols-2 gap-5">
                    {renderField("firstName", "First Name", { required: true, placeholder: "John" })}
                    {renderField("lastName", "Last Name", { required: true, placeholder: "Doe" })}
                    {renderField("dateOfBirth", "Date of Birth", { required: true, placeholder: "MM/DD/YYYY" })}
                    {renderSelect("maritalStatus", "Marital Status", ["Single", "Married", "Separated", "Divorced", "Widowed"], { required: true })}
                    {renderSelect("gender", "Gender", ["Female", "Male", "Non-specified"], { required: true })}
                    {renderField("emailAddress", "Email Address", { type: "email", required: true, placeholder: "john@example.com" })}
                  </div>
                </div>

                {/* Contact & Address */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Contact & Address</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    {renderField("streetAddress", "Street Address", { required: true, placeholder: "123 Main St" })}
                    {renderField("state", "State", { required: true, placeholder: "Texas" })}
                    {renderField("zipCode", "Zip Code", { required: true, placeholder: "76109" })}
                    {renderField("phoneNumber", "Phone Number", { required: true, placeholder: "(817) 555-0123" })}
                    {renderSelect("canReceiveTexts", "Can You Receive Texts?", ["Yes", "No"])}
                  </div>
                </div>

                {/* Driver & Vehicle Information */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Driver & Vehicle Information</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    {renderField("driverLicenseNumber", "Driver License Number", { required: true })}
                    {renderField("socialSecurityNumber", "Social Security Number", { placeholder: "Optional" })}
                    {renderField("vinNumber", "VIN Number", { placeholder: "Vehicle Identification Number" })}
                    {renderSelect("vehicleUse", "Vehicle Use", ["Commute to work or school", "Pleasure", "Business"])}
                    {renderSelect("estimatedAnnualMileage", "Estimated Annual Mileage", ["1-5K", "6-10K", "11-15K", "15K+"])}
                  </div>
                </div>

                {/* Additional Driver */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Additional Driver</h2>
                  <p className="text-sm text-muted-foreground mb-6">If applicable, add details for additional drivers on the policy.</p>
                  <div className="grid md:grid-cols-2 gap-5">
                    {renderField("additionalDriverFirstName", "First Name", { placeholder: "Optional" })}
                    {renderField("additionalDriverLastName", "Last Name", { placeholder: "Optional" })}
                    {renderField("additionalDriverDOB", "Date of Birth", { placeholder: "MM/DD/YYYY" })}
                    {renderField("additionalDriverLicense", "Driver License Number", { placeholder: "Optional" })}
                  </div>
                </div>

                {/* Discount Information */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Discount Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">Optional — may help us find you better rates.</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {renderField("occupation", "Occupation", { placeholder: "Your occupation" })}
                    {renderField("militaryService", "Military Service", { placeholder: "Branch / N/A" })}
                    {renderSelect("isStudent", "Are You a Student?", ["Yes", "No"])}
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
                    {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Your information is secure and will only be used to provide your quote.
                  </p>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </section>

      <Footer />

      {/* AI Assistant */}
      <QuoteAssistantModal ref={assistantRef} form={form} onSubmit={handleAssistantSubmit} onOpenChange={setPanelOpen} />
    </div>
    </TooltipProvider>
  );
}
