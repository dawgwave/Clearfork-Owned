import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "Listen to the SIG Clearfork Insurance Group podcast for expert insurance tips, industry insights, and coverage advice.",
  alternates: { canonical: "https://clearforkinsurance.com/podcast" },
};

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
