import type { Metadata } from "next";
import { lineQuoteMetadata } from "@/lib/quote-line-schemas";

export const metadata: Metadata = lineQuoteMetadata("commercial");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
