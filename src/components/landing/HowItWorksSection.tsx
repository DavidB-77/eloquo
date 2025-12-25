"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ClipboardPaste, Cpu, Download } from "lucide-react";

const STEPS = [
    {
        title: "Paste Your Prompt",
        description: "Drop your draft prompt into our editor. We support everything from short instructions to complex system prompts.",
        icon: <ClipboardPaste className="h-8 w-8" />,
    },
    {
        title: "AI Analysis",
        description: "Our Gemini-powered engine analyzes your prompt for clarity, token density, and model suitability.",
        icon: <Cpu className="h-8 w-8" />,
    },
    {
        title: "Get Enhanced Results",
        description: "Instantly receive multiple optimized versions of your prompt, ready to use in your favorite AI tool.",
        icon: <Download className="h-8 w-8" />,
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-primary/5 scroll-mt-20">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Transforming your prompts is a simple three-step process that takes seconds.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-start justify-between gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-primary/10 -z-10" />

                    {STEPS.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="flex-1 flex flex-col items-center text-center"
                        >
                            <div className="h-24 w-24 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center text-primary mb-6 relative shadow-sm">
                                <div className="absolute -top-2 -left-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                            <p className="text-muted-foreground max-w-xs leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
