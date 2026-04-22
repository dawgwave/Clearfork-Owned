"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LINE_QUOTE_FORM_FIELDS,
  LINE_QUOTE_SCHEMAS,
  QUOTE_TYPE_LABEL,
  type LineQuoteType,
} from "@/lib/quote-line-schemas";
import { submitLineQuoteToApi } from "@/lib/quote-submit-line-client";
import { US_STATES } from "@/lib/quote-types";
import { cn } from "@/lib/utils";

function defaultValuesFor(type: LineQuoteType): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of LINE_QUOTE_FORM_FIELDS[type]) {
    out[f.key] = "";
  }
  return out;
}

type Props = {
  quoteType: LineQuoteType;
};

export function LineQuoteForm({ quoteType }: Props) {
  const schema = LINE_QUOTE_SCHEMAS[quoteType];
  const fields = LINE_QUOTE_FORM_FIELDS[quoteType];
  const title = QUOTE_TYPE_LABEL[quoteType] ?? quoteType;
  const defaults = useMemo(() => defaultValuesFor(quoteType), [quoteType]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema as never),
    defaultValues: defaults,
  });

  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { id } = await submitLineQuoteToApi(
        quoteType,
        values as Record<string, string>,
      );
      setDoneId(id);
      reset(defaults);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  if (doneId !== null) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Request received</h1>
          <p className="mb-6 text-muted-foreground">
            Thank you. Reference <span className="font-mono font-semibold">#{doneId}</span>.
            We&apos;ll follow up shortly.
          </p>
          <Button asChild variant="outline">
            <Link href="/get-a-quote">Submit another type</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="border-b bg-gradient-to-br from-primary/10 to-primary/5 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Get a quote", href: "/get-a-quote" },
              { label: title },
            ]}
          />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tell us a bit about what you need. Fields marked implicitly are required.
          </p>
        </div>
      </section>

      <section className="py-12">
        <form
          onSubmit={onSubmit}
          className="mx-auto max-w-3xl space-y-8 px-6"
          noValidate
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {fields.map((f) => {
              const err = errors[f.key]?.message as string | undefined;
              const isState = f.key === "state";
              return (
                <div
                  key={f.key}
                  className={cn(
                    "space-y-2",
                    f.kind === "textarea" && "sm:col-span-2",
                  )}
                >
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {isState ? (
                    <>
                      <Input
                        id={f.key}
                        list={`${f.key}-states`}
                        autoComplete="address-level1"
                        placeholder={f.placeholder ?? "Start typing state…"}
                        {...register(f.key)}
                        className={err ? "border-destructive" : ""}
                      />
                      <datalist id={`${f.key}-states`}>
                        {US_STATES.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </>
                  ) : f.kind === "textarea" ? (
                    <textarea
                      id={f.key}
                      rows={4}
                      placeholder={f.placeholder}
                      className={cn(
                        "flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        err && "border-destructive",
                      )}
                      {...register(f.key)}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      type={f.kind === "email" ? "email" : f.kind === "tel" ? "tel" : "text"}
                      placeholder={f.placeholder}
                      autoComplete={
                        f.key === "firstName"
                          ? "given-name"
                          : f.key === "lastName"
                            ? "family-name"
                            : f.key === "emailAddress"
                              ? "email"
                              : f.key === "phoneNumber"
                                ? "tel"
                                : f.key === "streetAddress"
                                  ? "street-address"
                                  : f.key === "zipCode"
                                    ? "postal-code"
                                    : undefined
                      }
                      {...register(f.key)}
                      className={err ? "border-destructive" : ""}
                    />
                  )}
                  {err ? (
                    <p className="text-sm text-destructive">{err}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <div className="flex flex-wrap gap-4">
            <Button type="submit" disabled={submitting} className="min-w-[160px]">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Submit request"
              )}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/get-a-quote">Back to all types</Link>
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
