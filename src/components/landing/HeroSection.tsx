"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />
            </div>

            <Container className="relative">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                            <Sparkles className="h-3 w-3" />
                            <span>Transform Your AI Workflow</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-8">
                            Transform Your AI Prompts Into <span className="text-primary italic">Powerful</span> Results
                        </h1>

                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Eloquo optimizes your raw prompts for ChatGPT, Claude, and Gemini. Get higher quality responses while reducing API token costs by up to 40%.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-xl" asChild>
                                <Link href="/signup">
                                    Start Optimizing Free <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12" asChild>
                                <Link href="#how-it-works">See How It Works</Link>
                            </Button>
                        </div>

                        <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                                <span className="font-bold text-foreground">10+</span>
                                <span>Optimizations Free</span>
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="flex items-center space-x-1">
                                <span className="font-bold text-foreground">Multi-Model</span>
                                <span>Support</span>
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="flex items-center space-x-1">
                                <span className="font-bold text-foreground">30%</span>
                                <span>Cost Savings</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Dashboard Preview Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mt-20 relative"
                >
                    <div className="rounded-2xl border bg-card p-2 shadow-2xl overflow-hidden">
                        <div className="rounded-xl overflow-hidden border bg-muted/50 aspect-[16/9] relative">
                            {/* This would be an image or a complex UI mockup */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-muted-foreground mb-2">Dashboard Preview Mockup</div>
                                    <div className="h-1 w-24 bg-primary/20 rounded-full mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute -top-6 -right-6 h-24 w-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-accent/10 rounded-full blur-32 animate-pulse" />
                </motion.div>
            </Container>
        </section>
    );
}
