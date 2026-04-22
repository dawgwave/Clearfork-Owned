import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Choose the type of insurance you need and start a quote or connect with SIG Clearfork Insurance Group in Benbrook, TX.",
  alternates: { canonical: "https://clearforkinsurance.com/get-a-quote" },
};

export default function GetAQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
