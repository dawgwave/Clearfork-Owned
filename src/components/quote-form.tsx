"use client";

import { useState, type FormEvent } from "react";

const INSURANCE_TYPES = [
  "Home Insurance",
  "Auto Insurance",
  "Commercial Insurance",
  "Life Insurance",
  "Cyber Insurance",
  "Performance & Bid Bonds",
  "Other",
];

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--green-primary)]/20 bg-[var(--green-light)] p-8 text-center">
        <h3 className="mb-2 text-xl font-bold text-[var(--navy)]">Thank You!</h3>
        <p className="text-[var(--slate)]">
          We&apos;ve received your request. A member of our team will reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          required
          className="rounded-lg border border-[var(--mist)] px-4 py-3 text-sm focus:border-[var(--green-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--green-primary)]"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          required
          className="rounded-lg border border-[var(--mist)] px-4 py-3 text-sm focus:border-[var(--green-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--green-primary)]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          className="rounded-lg border border-[var(--mist)] px-4 py-3 text-sm focus:border-[var(--green-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--green-primary)]"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          className="rounded-lg border border-[var(--mist)] px-4 py-3 text-sm focus:border-[var(--green-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--green-primary)]"
        />
      </div>
      <select
        name="insuranceType"
        className="w-full rounded-lg border border-[var(--mist)] px-4 py-3 text-sm text-[var(--slate)] focus:border-[var(--green-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--green-primary)]"
      >
        <option value="">Select Insurance Type</option>
        {INSURANCE_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <textarea
        name="message"
        rows={4}
        placeholder="Tell us about your insurance needs..."
        className="w-full rounded-lg border border-[var(--mist)] px-4 py-3 text-sm focus:border-[var(--green-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--green-primary)]"
      />
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--green-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--green-dark)]"
      >
        Get My Quote
      </button>
    </form>
  );
}
