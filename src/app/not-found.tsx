import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center py-20">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold text-[var(--green-primary)]">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-[var(--navy)]">Page Not Found</h2>
        <p className="mb-8 text-[var(--slate)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-full bg-[var(--green-primary)] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--green-dark)]"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
