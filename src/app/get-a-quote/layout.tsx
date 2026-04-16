import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free insurance quote from SIG Clearfork Insurance Group — home, auto, commercial, life, cyber, and bonds in Benbrook, TX.",
  alternates: { canonical: "https://clearforkinsurance.com/get-a-quote" },
};

export default function GetAQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
