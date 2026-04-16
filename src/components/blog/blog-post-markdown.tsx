"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

const mdComponents: Components = {
  h2: ({ children, ...props }) => (
    <h2
      className="mt-12 scroll-mt-24 border-b border-[#E5E7EB] pb-2 text-2xl font-bold tracking-tight text-[#0A0A0A] first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-8 text-xl font-semibold text-[#0A0A0A]" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-5 text-[16px] leading-[28px] text-[#374151]" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="mb-6 ml-1 list-disc space-y-2.5 py-1 pl-6 text-[16px] leading-[28px] text-[#374151]"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mb-6 ml-1 list-decimal space-y-2.5 py-1 pl-6 text-[16px] leading-[28px] text-[#374151]"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1 marker:text-primary" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-[#0A0A0A]" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-[#374151]" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 border-l-4 border-primary/70 bg-[#F9FAFB] py-4 pl-5 pr-4 text-[15px] leading-[26px] text-[#374151] [&>p]:mb-0"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-[#E5E7EB]" />,
};

export function BlogPostMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="blog-post-md">
      <ReactMarkdown components={mdComponents}>{markdown}</ReactMarkdown>
    </div>
  );
}
