"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary -z-10" />
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px] -z-10" />

            <Container>
                <div className="bg-primary-950/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-20 text-center text-primary-foreground max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-8">
                            Ready to Supercharge Your AI Prompts?
                        </h2>
                        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto opacity-80">
                            Join 1,000+ teams optimizing their AI workflows with Eloquo. Start for free today and see the results instantly.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-lg px-10 h-14 font-bold shadow-xl" asChild>
                                <Link href="/signup">
                                    Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                        <p className="mt-8 text-sm text-primary-100 opacity-60">
                            No credit card required • 10 free optimizations • Multi-model support
                        </p>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
