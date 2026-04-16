import { PageShell } from "@/components/page-shell";

const STEPS = [
  {
    n: 1,
    title: "Tell us what you need",
    body: "Fill out a quick form or call us. No jargon, no lengthy questionnaires — just the basics.",
  },
  {
    n: 2,
    title: "We shop multiple carriers for you",
    body: "As an independent agency, we compare rates across top insurers so you don't have to.",
  },
  {
    n: 3,
    title: "You choose, we handle the rest",
    body: "Pick the plan that fits. We bind your coverage and stay available when you need to file a claim.",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--mist)] bg-secondary/60 py-16 lg:py-24"
      aria-labelledby="how-it-works-heading"
    >
      <PageShell>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--slate)]">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-[var(--navy)] lg:text-4xl"
          >
            Getting covered is simple
          </h2>

          <ol className="mt-6 list-none space-y-0 lg:mt-8">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="flex gap-3 border-b border-[var(--mist)] py-5 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  aria-hidden
                >
                  {step.n}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[var(--navy)]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--slate)] sm:text-[15px]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </PageShell>
    </section>
  );
}
