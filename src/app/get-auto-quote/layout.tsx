import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get an Auto Insurance Quote",
  description:
    "Request a free auto insurance quote from SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: { canonical: "https://clearforkinsurance.com/get-auto-quote" },
};

export default function GetAutoQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
