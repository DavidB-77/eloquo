"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { ContactModal } from "@/components/landing/ContactModal";

export default function LandingPage() {
  const [isContactOpen, setIsContactOpen] = React.useState(false);

  // Global listener for contact modal triggers (from links/buttons)
  React.useEffect(() => {
    const handleContactTrigger = (e: any) => {
      if (e.detail?.type === "contact") setIsContactOpen(true);
    };
    window.addEventListener("trigger-contact", handleContactTrigger);
    return () => window.removeEventListener("trigger-contact", handleContactTrigger);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofBar />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <BeforeAfterSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
