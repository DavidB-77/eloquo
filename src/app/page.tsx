"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhyEloquoIsDifferentSection } from "@/components/landing/WhyEloquoIsDifferentSection";
import { WhatEloquoDoesSection } from "@/components/landing/WhatEloquoDoesSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { EloquoProtocolSection } from "@/components/landing/EloquoProtocolSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { UseEloquoYourWaySection } from "@/components/landing/UseEloquoYourWaySection";
import { ProjectProtocolSection } from "@/components/landing/ProjectProtocolSection";
import { BMADSection } from "@/components/landing/BMADSection";
import { BuiltForProfessionalsSection } from "@/components/landing/BuiltForProfessionalsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { ContactModal } from "@/components/landing/ContactModal";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

export default function LandingPage() {
  const [isContactOpen, setIsContactOpen] = React.useState(false);

  React.useEffect(() => {
    const handleContactTrigger = (e: any) => {
      if (e.detail?.type === "contact") setIsContactOpen(true);
    };
    window.addEventListener("trigger-contact", handleContactTrigger);
    return () => window.removeEventListener("trigger-contact", handleContactTrigger);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <ParticlesBackground />
      <Navbar />
      <main>
        {/* 1. Hero with animated demo */}
        <HeroSection />

        {/* 2. Why Eloquo Is Different - Adaptive Intelligence */}
        <WhyEloquoIsDifferentSection />

        {/* 3. What Eloquo Does - Feature overview */}
        <WhatEloquoDoesSection />

        {/* 4. Problems we solve */}
        <ProblemSection />

        {/* 5. How it works - 3-step simple explanation */}
        <HowItWorksSection />

        {/* 6. The Eloquo Protocol - 4-stage pipeline detail */}
        <EloquoProtocolSection />

        {/* 7. Core Features grid */}
        <FeaturesSection />

        {/* 8. Use Eloquo Your Way - Integrations */}
        <UseEloquoYourWaySection />

        {/* 9. Project Protocol for developers */}
        <ProjectProtocolSection />

        {/* 10. BMAD for developers */}
        <BMADSection />

        {/* 11. Built for Professionals - Persona cards */}
        <BuiltForProfessionalsSection />

        {/* 12. Pricing */}
        <PricingSection />

        {/* 13. FAQ / Knowledge Base */}
        <FAQSection />

        {/* 14. Footer CTA */}
        <CTASection />
      </main>
      <Footer />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <ScrollToTop />
    </div>
  );
}
