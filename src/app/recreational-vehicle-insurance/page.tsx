import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Breadcrumbs } from "@/components/breadcrumbs";
import CTASection from "@/components/cta-section";
import { serviceSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Boat, RV, ATV & Motorcycle Insurance",
  description:
    "Protect your recreational vehicles with comprehensive insurance coverage. Get quotes for boat, RV, ATV, and motorcycle insurance in Texas.",
  openGraph: {
    title: "Boat, RV, ATV & Motorcycle Insurance | SIG Clearfork Insurance Group",
    description:
      "Protect your recreational vehicles with comprehensive insurance coverage. Get quotes for boat, RV, ATV, and motorcycle insurance in Texas.",
  },
};

const jsonLd = serviceSchema(
  "Recreational Vehicle Insurance",
  "Comprehensive insurance coverage for boats, RVs, ATVs, and motorcycles in Texas. Protect your recreational vehicles with specialized policies from SIG Clearfork Insurance Group.",
  "https://clearforkinsurance.com/recreational-vehicle-insurance"
);

export default function RecreationalVehicleInsurancePage() {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Insurance Services", href: "/#services" },
          { label: "Boat/RV/ATV/Motorcycle Insurance" },
        ]}
      />

      <div className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Boat, RV, ATV & Motorcycle Insurance
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Protect your recreational vehicles and enjoy peace of mind on every adventure. 
              From weekend lake trips to cross-country RV journeys, we've got you covered.
            </p>
          </div>

          {/* Coverage Types */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚤 Boat Insurance</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Hull and machinery coverage</li>
                <li>• Liability protection</li>
                <li>• Personal property coverage</li>
                <li>• Medical payments</li>
                <li>• Uninsured boater protection</li>
                <li>• Emergency towing and assistance</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏕️ RV Insurance</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Comprehensive and collision</li>
                <li>• Personal belongings coverage</li>
                <li>• Emergency expense coverage</li>
                <li>• Vacation liability</li>
                <li>• Roadside assistance</li>
                <li>• Full-timer coverage options</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏍️ Motorcycle Insurance</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Bodily injury and property damage liability</li>
                <li>• Comprehensive and collision</li>
                <li>• Medical payments coverage</li>
                <li>• Uninsured/underinsured motorist</li>
                <li>• Custom parts and equipment</li>
                <li>• Roadside assistance</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🏁 ATV Insurance</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Liability coverage</li>
                <li>• Comprehensive and collision</li>
                <li>• Medical payments</li>
                <li>• Theft and vandalism protection</li>
                <li>• Accessories coverage</li>
                <li>• Trail and off-road coverage</li>
              </ul>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
              Why Choose SIG Clearfork for Recreational Vehicle Insurance?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Specialized Coverage</h3>
                <p className="text-gray-600">
                  Tailored policies for each type of recreational vehicle with specific protections.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-3">💰</div>
                <h3 className="font-semibold text-gray-900 mb-2">Competitive Rates</h3>
                <p className="text-gray-600">
                  Multi-policy discounts and competitive rates to protect your investment.
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-3">🤝</div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Service</h3>
                <p className="text-gray-600">
                  Local agents who understand recreational vehicle needs and usage.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Protect Your Recreational Vehicles?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact us today for a personalized quote on boat, RV, ATV, or motorcycle insurance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:8172498683"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Call (817) 249-8683
              </a>
              <a
                href="/get-a-quote"
                className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 transition-colors"
              >
                Get a Quote Online
              </a>
            </div>
          </div>
        </div>
      </div>

      <CTASection />
    </PageShell>
  );
}