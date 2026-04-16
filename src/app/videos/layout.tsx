import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Watch educational insurance videos from SIG Clearfork Insurance Group covering homeowners insurance, disability, and more.",
  alternates: { canonical: "https://clearforkinsurance.com/videos" },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
