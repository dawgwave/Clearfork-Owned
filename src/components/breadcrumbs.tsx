import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--slate)]">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <span className="mx-1">/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-[var(--green-primary)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--ink)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
