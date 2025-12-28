"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhatEloquoDoesSection } from "@/components/landing/WhatEloquoDoesSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { EloquoProtocolSection } from "@/components/landing/EloquoProtocolSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ProjectProtocolSection } from "@/components/landing/ProjectProtocolSection";
import { BMADSection } from "@/components/landing/BMADSection";
import { BuiltForProfessionalsSection } from "@/components/landing/BuiltForProfessionalsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { ContactModal } from "@/components/landing/ContactModal";
import { ParticlesBackground } from "@/components/landing/ParticlesBackground";

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

        {/* 2. What Eloquo Does - Feature overview */}
        <WhatEloquoDoesSection />

        {/* 3. Problems we solve */}
        <ProblemSection />

        {/* 4. How it works - 3-step simple explanation */}
        <HowItWorksSection />

        {/* 5. The Eloquo Protocol - 4-stage pipeline detail */}
        <EloquoProtocolSection />

        {/* 6. Core Matrix Modules - Features grid */}
        <FeaturesSection />

        {/* 7. Project Protocol for developers */}
        <ProjectProtocolSection />

        {/* 8. BMAD for developers */}
        <BMADSection />

        {/* 8. Built for Professionals - Persona cards */}
        <BuiltForProfessionalsSection />

        {/* 9. Pricing */}
        <PricingSection />

        {/* 10. FAQ / Knowledge Base */}
        <FAQSection />

        {/* 11. Footer CTA */}
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
