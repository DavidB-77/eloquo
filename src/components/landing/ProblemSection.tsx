"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, ZapOff, TrendingDown } from "lucide-react";

const PAIN_POINTS = [
    {
        title: "Inconsistent AI Outputs",
        description: "Poorly structured prompts lead to unpredictable results, forcing you to retry and waste time.",
        icon: <ZapOff className="h-10 w-10 text-primary" />,
    },
    {
        title: "Wasted API Credits",
        description: "Verbose and inefficient prompts consume 2-3x more tokens than necessary, ballooning your bills.",
        icon: <TrendingDown className="h-10 w-10 text-primary" />,
    },
    {
        title: "No Visibility",
        description: "Without tracking, you have no way to know which prompt versions performed best or saved most.",
        icon: <AlertCircle className="h-10 w-10 text-primary" />,
    },
];

export function ProblemSection() {
    return (
        <section className="py-24 bg-muted/30">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                        Bad Prompts Cost You Time and Money
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Using AI shouldn&apos;t be a guessing game. Eloquo solves the three biggest hurdles in AI communication.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PAIN_POINTS.map((point, index) => (
                        <motion.div
                            key={point.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-none shadow-none bg-transparent hover:bg-card hover:shadow-md transition-all p-8 text-center group">
                                <CardContent className="p-0">
                                    <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform">
                                        {point.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{point.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {point.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
