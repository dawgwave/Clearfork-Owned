import HeroSection from "@/components/hero-section";
import ContentHubSection from "@/components/content-hub-section";
import ServicesSection from "@/components/services-section";
import HowItWorksSection from "@/components/how-it-works-section";
import AboutSection from "@/components/about-section";
import CtaSection from "@/components/cta-section";
import ContactSection from "@/components/contact-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ContentHubSection />
      <ServicesSection />
      <HowItWorksSection />
      <AboutSection />
      <CtaSection />
      <ContactSection />
    </>
  );
}
