import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/blogs", destination: "/blog", permanent: true },
      { source: "/blogs/rss.xml", destination: "/blog/rss.xml", permanent: true },
      { source: "/blogs/:slug", destination: "/blog/:slug", permanent: true },
      {
        source: "/blog/how-we-protect-your-blended-family",
        destination: "/blog/insurance-rates-are-a-black-box-texas-property",
        permanent: true,
      },
      {
        source: "/blog/how-end-of-life-planning-can-ease-financial-concerns",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/life-insurance-5-signs-you-might-be-underinsured",
        destination: "/blog/insurance-rates-black-box-auto-insurance-edition",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
