import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for SIG Clearfork Insurance Group (United States): how we collect, use, disclose, and protect your personal information.",
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
            Effective date: January 1, 2025 · Last updated: May 8, 2026
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            This policy applies to visitors and customers located in the United States who use our website,
            contact us, or obtain quotes or insurance services through SIG Clearfork Insurance Group. We do
            not intend this Site for users outside the U.S.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose max-w-none">
            <p>
              SIG Clearfork Insurance Group (&ldquo;Clearfork Insurance,&rdquo;
              &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the
              privacy and security of your personal information. This Privacy Policy describes how we
              collect, use, disclose, and safeguard information when you visit our website at{" "}
              <a href="https://clearforkinsurance.com">clearforkinsurance.com</a> (&ldquo;Site&rdquo;),
              contact us, create an account, or obtain quotes or insurance services.
            </p>
            <p>
              By accessing or using our Site, you agree to this Privacy Policy. If you do not agree,
              please do not use the Site.
            </p>
            <p className="text-sm text-muted-foreground">
              This notice is provided for general information and does not modify any rights or obligations
              under your insurance contracts or notices you receive directly from insurance carriers.
            </p>

            <h2>1. Information we collect</h2>
            <h3>Personal information you provide</h3>
            <p>We collect personal information that you voluntarily provide when you:</p>
            <ul>
              <li>Request an insurance quote</li>
              <li>Complete a contact or inquiry form</li>
              <li>Create or sign in to an account (including optional sign-in through Google or Apple)</li>
              <li>Call, email, or chat with us</li>
              <li>Subscribe to our blog or newsletter</li>
              <li>Apply for or manage an insurance policy</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>
                Full name, date of birth, and Social Security number when required for underwriting or
                verification
              </li>
              <li>Home address and mailing address</li>
              <li>Email address and telephone number</li>
              <li>Driver&apos;s license number and vehicle information</li>
              <li>Property details (address, square footage, year built, etc.)</li>
              <li>Business information (EIN, business type, payroll, etc.)</li>
              <li>Financial information necessary for insurance underwriting</li>
              <li>Claims history and coverage preferences</li>
            </ul>

            <h3>Information collected automatically</h3>
            <p>When you visit our Site, we may automatically collect:</p>
            <ul>
              <li>IP address, browser type, operating system, and device information</li>
              <li>Pages visited, time spent on pages, and referring URLs</li>
              <li>Cookies and similar technologies (see Section 6)</li>
            </ul>

            <h2>2. How we use your information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>
                <strong>Provide insurance services:</strong> process quotes, place coverage, manage
                renewals, and assist with claims
              </li>
              <li>
                <strong>Communicate with you:</strong> respond to inquiries, send documents, and provide
                support
              </li>
              <li>
                <strong>Operate accounts:</strong> authenticate users and maintain secure sessions
              </li>
              <li>
                <strong>Improve our services:</strong> analyze Site usage and enhance content and tools
              </li>
              <li>
                <strong>Compliance:</strong> meet applicable federal and state laws and insurance industry
                requirements
              </li>
              <li>
                <strong>Marketing:</strong> send information about products or services that may interest you
                (you may opt out as described below)
              </li>
              <li>
                <strong>Security:</strong> detect fraud, abuse, unauthorized access, or illegal activity
              </li>
            </ul>

            <h2>3. How we share your information</h2>
            <p>
              We do <strong>not</strong> sell your personal information for money. We do{" "}
              <strong>not</strong> share personal information for cross-context behavioral advertising as a
              “sale” under applicable state privacy laws, except as described here or as permitted by law.
            </p>
            <p>We may share information with:</p>
            <ul>
              <li>
                <strong>Insurance carriers and underwriters:</strong> to obtain quotes, bind coverage, and
                service policies and claims
              </li>
              <li>
                <strong>Service providers:</strong> vendors who host our Site, send email, provide
                analytics, or support operations under confidentiality and contractual safeguards
              </li>
              <li>
                <strong>Authentication providers:</strong> when you choose Google or Apple sign-in, those
                providers process login according to their respective privacy policies
              </li>
              <li>
                <strong>Legal and regulatory authorities:</strong> when required by law, subpoena, or
                regulation, or to protect rights and safety
              </li>
              <li>
                <strong>Business transfers:</strong> in a merger, acquisition, or asset sale, subject to
                applicable legal requirements
              </li>
            </ul>

            <h2>4. Insurance-related information (GLBA)</h2>
            <p>
              Certain personal information we collect in connection with insurance products or services may be
              treated as nonpublic personal information under the federal Gramm-Leach-Bliley Act (GLBA) and
              related state insurance privacy laws. Where GLBA applies, we limit collection, use, and
              disclosure as described in this policy and in any separate privacy notices required by your
              insurer or applicable law.
            </p>

            <h2>5. Data security</h2>
            <p>
              We use reasonable administrative, technical, and physical safeguards designed to protect
              personal information, including encrypted transmission (HTTPS), access controls, and secure
              hosting practices.
            </p>
            <p>
              No electronic transmission or storage is completely secure. We cannot guarantee absolute
              security.
            </p>

            <h2>6. Data retention</h2>
            <p>
              We retain personal information as long as needed for the purposes above, to comply with legal
              obligations, resolve disputes, and enforce agreements. Insurance and claims records may be
              retained as required by applicable state and federal rules.
            </p>

            <h2>7. Cookies, analytics, and marketing tags</h2>
            <p>Our Site may use cookies and similar technologies to:</p>
            <ul>
              <li>Maintain preferences and session functionality</li>
              <li>
                Measure Site traffic and engagement through Google Analytics when configured (you may use
                browser controls or Google&apos;s opt-out tools)
              </li>
              <li>
                Load Google Tag Manager to deploy and manage analytics or marketing tags in accordance with
                our configuration and Google&apos;s policies
              </li>
              <li>Reduce spam and automated abuse through Google reCAPTCHA when enabled</li>
            </ul>
            <p>
              You can control cookies through browser settings; disabling cookies may limit some features.
            </p>
            <h3>Google Analytics</h3>
            <p>
              Google Analytics helps us understand aggregated Site usage. You may install the{" "}
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
              When enabled, reCAPTCHA may collect device and interaction data sent to Google for analysis.
              Use is subject to Google&apos;s{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
              .
            </p>

            <h2>8. U.S. state privacy rights</h2>
            <p>
              Depending on where you live, state laws (including California, Colorado, Connecticut, Virginia,
              Utah, Texas, and others) may grant you rights regarding your personal information, such as:
            </p>
            <ul>
              <li>Right to know what categories or specific pieces we collect, use, or disclose</li>
              <li>Right to request deletion, subject to legal exceptions</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to opt out of certain processing (for example, sale, sharing, or targeted
                advertising where those terms apply)</li>
              <li>Right to appeal our response to your request under some state laws</li>
              <li>Right not to receive discriminatory treatment for exercising privacy rights</li>
            </ul>
            <p>
              <strong>California residents:</strong> Under the California Consumer Privacy Act as amended
              (CPRA), you may submit requests as described below. We will verify your request consistent with
              applicable law. You may designate an authorized agent in writing where permitted.
            </p>
            <p>
              To exercise rights, contact us using Section 11. Include your name, contact information, and a
              description of your request. We may need additional information to verify your identity before
              responding.
            </p>

            <h2>9. Third-party links</h2>
            <p>
              Our Site may link to carrier portals, social networks, or other sites we do not control. Their
              privacy practices govern those sites. Review their policies before providing information.
            </p>

            <h2>10. Children&apos;s privacy</h2>
            <p>
              Our Site is not directed to children under 13. We do not knowingly collect personal information
              from children under 13. If you believe we have collected such information, contact us and we will
              take appropriate steps to delete it.
            </p>

            <h2>11. Contact us</h2>
            <p>Questions about this Privacy Policy or our privacy practices:</p>
            <ul>
              <li>
                <strong>SIG Clearfork Insurance Group</strong>
              </li>
              <li>992 Winscott Rd, Suite B, Benbrook, TX 76126</li>
              <li>
                Phone: <a href="tel:8172498683">(817) 249-8683</a>
              </li>
              <li>
                Email:{" "}
                <a href="mailto:clearfork@sig4you.com">clearfork@sig4you.com</a>
              </li>
            </ul>

            <h2>12. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we will post
              the updated policy on this page and revise the &ldquo;Last updated&rdquo; date. Your continued
              use of the Site after updates constitutes acceptance of the revised policy to the extent
              permitted by law.
            </p>

            <hr />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SIG Clearfork Insurance Group. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
