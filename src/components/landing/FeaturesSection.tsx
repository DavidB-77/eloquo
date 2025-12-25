"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    BarChart3,
    Wand2,
    Layers,
    DollarSign,
    History,
    Users
} from "lucide-react";

const FEATURES = [
    {
        title: "Prompt Analysis",
        description: "Deep analysis of your prompt's structure, clarity, and effectiveness.",
        icon: <BarChart3 className="h-6 w-6" />,
    },
    {
        title: "One-Click Optimization",
        description: "Instantly transform loose ideas into high-performing, expert-level prompts.",
        icon: <Wand2 className="h-6 w-6" />,
    },
    {
        title: "Multi-Model Support",
        description: "Get model-specific optimizations for ChatGPT, Claude, and Gemini.",
        icon: <Layers className="h-6 w-6" />,
    },
    {
        title: "Cost Estimation",
        description: "See exactly how many tokens you save and your projected ROI.",
        icon: <DollarSign className="h-6 w-6" />,
    },
    {
        title: "History & Versioning",
        description: "Never lose a great prompt again. Track iterations and revert anytime.",
        icon: <History className="h-6 w-6" />,
    },
    {
        title: "Team Library",
        description: "Share your best-performing prompts with your entire organization.",
        icon: <Users className="h-6 w-6" />,
        comingSoon: true,
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 scroll-mt-20">
            <Container>
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4">Everything You Need</Badge>
                    <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                        Master AI Communication
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Powerful tools designed to make your AI interactions faster, better, and significantly cheaper.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full hover:border-primary/50 transition-colors group">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="flex items-center justify-between">
                                        {feature.title}
                                        {feature.comingSoon && (
                                            <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">Coming Soon</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {feature.description}
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
