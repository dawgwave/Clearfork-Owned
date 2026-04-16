import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for SIG Clearfork Insurance Group — how we collect, use, disclose, and protect your personal information.",
  alternates: { canonical: "https://clearforkinsurance.com/privacy" },
};

export default function PrivacyPage() {
  const schema = breadcrumbSchema([
    { name: "Home", url: "https://clearforkinsurance.com/" },
    { name: "Privacy Policy", url: "https://clearforkinsurance.com/privacy" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Effective Date: January 1, 2025 &middot; Last Updated: April 7,
            2026
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose max-w-none">
            <p>
              SIG Clearfork Insurance Group (&ldquo;Clearfork
              Insurance,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) is committed to protecting the privacy and
              security of your personal information. This Privacy Policy
              describes how we collect, use, disclose, and safeguard
              information when you visit our website at{" "}
              <a href="https://clearforkinsurance.com">
                clearforkinsurance.com
              </a>{" "}
              (the &ldquo;Site&rdquo;), contact us, or use our services.
            </p>
            <p>
              By accessing or using our Site, you agree to the terms of this
              Privacy Policy. If you do not agree, please do not use the Site.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>Personal Information You Provide</h3>
            <p>
              We collect personal information that you voluntarily provide when
              you:
            </p>
            <ul>
              <li>Request an insurance quote</li>
              <li>Complete a contact or inquiry form</li>
              <li>Call, email, or chat with us</li>
              <li>Subscribe to our blog or newsletter</li>
              <li>Apply for or manage an insurance policy</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>
                Full name, date of birth, and Social Security number (when
                required for underwriting)
              </li>
              <li>Home address and mailing address</li>
              <li>Email address and telephone number</li>
              <li>
                Driver&apos;s license number and vehicle information
              </li>
              <li>
                Property details (address, square footage, year built, etc.)
              </li>
              <li>Business information (EIN, business type, payroll, etc.)</li>
              <li>
                Financial information necessary for insurance underwriting
              </li>
              <li>Claims history and insurance coverage preferences</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>
              When you visit our Site, we may automatically collect certain
              information, including:
            </p>
            <ul>
              <li>
                IP address, browser type, operating system, and device
                information
              </li>
              <li>Pages visited, time spent on pages, and referring URLs</li>
              <li>
                Cookies and similar tracking technologies (see Section 6
                below)
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes:
            </p>
            <ul>
              <li>
                <strong>Provide Insurance Services:</strong> Process quote
                requests, bind policies, manage renewals, and handle claims
              </li>
              <li>
                <strong>Communicate With You:</strong> Respond to inquiries,
                send policy documents, and provide customer support
              </li>
              <li>
                <strong>Improve Our Services:</strong> Analyze website usage
                to enhance user experience and service offerings
              </li>
              <li>
                <strong>Compliance:</strong> Comply with applicable laws,
                regulations, and insurance industry requirements
              </li>
              <li>
                <strong>Marketing:</strong> Send information about products,
                services, and promotions that may interest you (you may opt
                out at any time)
              </li>
              <li>
                <strong>Security:</strong> Detect, prevent, and address fraud,
                unauthorized access, and other illegal activities
              </li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>
              We do not sell, rent, or trade your personal information to third
              parties for their marketing purposes. We may share your
              information with:
            </p>
            <ul>
              <li>
                <strong>Insurance Carriers and Underwriters:</strong> To
                obtain quotes, bind coverage, and process claims on your
                behalf
              </li>
              <li>
                <strong>Service Providers:</strong> Third-party vendors who
                assist us with website hosting, data analytics, email
                delivery, and other business operations, subject to
                confidentiality agreements
              </li>
              <li>
                <strong>Legal and Regulatory Authorities:</strong> When
                required by law, court order, or government regulation, or to
                protect our legal rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets, your information may
                be transferred as part of that transaction
              </li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical
              safeguards to protect your personal information from
              unauthorized access, use, alteration, or disclosure. These
              measures include encrypted data transmission (SSL/TLS), secure
              server infrastructure, access controls, and employee training.
            </p>
            <p>
              However, no method of electronic transmission or storage is 100%
              secure. While we strive to protect your information, we cannot
              guarantee its absolute security.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to
              fulfill the purposes described in this Privacy Policy, comply
              with legal obligations, resolve disputes, and enforce our
              agreements. Insurance records may be retained for the duration
              required by applicable state and federal regulations.
            </p>

            <h2>6. Cookies and Tracking Technologies</h2>
            <p>Our Site uses cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>
                Analyze website traffic and usage patterns (via Google
                Analytics)
              </li>
              <li>Prevent spam and bot activity (via Google reCAPTCHA)</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling
              cookies may limit certain features of our Site.
            </p>
            <h3>Google Analytics</h3>
            <p>
              We use Google Analytics to understand how visitors interact with
              our Site. Google Analytics collects information anonymously and
              reports website trends without identifying individual visitors.
              You can opt out of Google Analytics by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </p>
            <h3>Google reCAPTCHA</h3>
            <p>
              Our forms use Google reCAPTCHA to prevent spam submissions. This
              service may collect hardware and software information, such as
              device and application data, and send it to Google for analysis.
              Use of reCAPTCHA is subject to Google&apos;s{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              .
            </p>

            <h2>7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal
                information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request that we correct
                inaccurate or incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request that we delete your
                personal information, subject to legal and contractual
                retention requirements
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing
                communications at any time by clicking the
                &ldquo;unsubscribe&rdquo; link in our emails or contacting us
                directly
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the
              information in Section 10.
            </p>

            <h2>8. Third-Party Links</h2>
            <p>
              Our Site may contain links to third-party websites, including
              insurance carrier portals, social media platforms, and other
              resources. We are not responsible for the privacy practices or
              content of these external sites. We encourage you to review the
              privacy policies of any third-party site you visit.
            </p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our Site is not intended for children under the age of 13. We do
              not knowingly collect personal information from children under
              13. If we learn that we have collected information from a child
              under 13, we will take steps to delete it promptly. If you
              believe a child has provided us with personal information,
              please contact us.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <ul>
              <li>
                <strong>SIG Clearfork Insurance Group</strong>
              </li>
              <li>992 Winscott Rd, Suite B, Benbrook, TX 76126</li>
              <li>
                Phone:{" "}
                <a href="tel:8172498683">(817) 249-8683</a>
              </li>
              <li>
                Email:{" "}
                <a href="mailto:clearfork@sig4you.com">
                  clearfork@sig4you.com
                </a>
              </li>
            </ul>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or
              other factors. When we make material changes, we will update the
              &ldquo;Last Updated&rdquo; date at the top of this page. We
              encourage you to review this Privacy Policy periodically.
            </p>

            <hr />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SIG Clearfork Insurance
              Group. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
