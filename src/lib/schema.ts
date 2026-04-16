export const SITE_URL = "https://clearforkinsurance.com";

export const BUSINESS_INFO = {
  name: "SIG Clearfork Insurance Group",
  url: SITE_URL,
  phone: "(817) 249-8683",
  email: "clearfork@sig4you.com",
  address: {
    street: "992 Winscott Rd Suite B",
    city: "Benbrook",
    state: "TX",
    zip: "76126",
    country: "US",
  },
  geo: { lat: 32.6737, lng: -97.4606 },
  description:
    "Your trusted insurance partner with 90 years of combined experience, providing comprehensive coverage solutions for individuals and businesses in Benbrook, TX.",
};

/** Google Maps listing for this office (stable business CID). */
export const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps?cid=15513863177535307973&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYASAA&hl=en-US";

export function insuranceAgencySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: BUSINESS_INFO.name,
    url: BUSINESS_INFO.url,
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    description: BUSINESS_INFO.description,
    logo: `${SITE_URL}/logo.svg`,
    image: `${SITE_URL}/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_INFO.address.street,
      addressLocality: BUSINESS_INFO.address.city,
      addressRegion: BUSINESS_INFO.address.state,
      postalCode: BUSINESS_INFO.address.zip,
      addressCountry: BUSINESS_INFO.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_INFO.geo.lat,
      longitude: BUSINESS_INFO.geo.lng,
    },
    areaServed: {
      "@type": "City",
      name: "Benbrook",
      containedInPlace: { "@type": "State", name: "Texas" },
    },
    sameAs: [
      "https://www.facebook.com/SIGClearforkInsurance",
      "https://www.linkedin.com/company/sig-clearfork-insurance-group",
    ],
  };
}

export function serviceSchema(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "InsuranceAgency",
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.url,
    },
    areaServed: {
      "@type": "City",
      name: "Benbrook",
      containedInPlace: { "@type": "State", name: "Texas" },
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogPostSchema(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.url,
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.url,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
}
