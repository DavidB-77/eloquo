"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Star } from "lucide-react";

const TESTIMONIALS = [
    {
        quote: "Eloquo has transformed how our content team uses AI. Our outputs are more consistent, and we've cut our API costs by nearly 30%.",
        name: "Sarah Chen",
        title: "Head of Content",
        company: "Vocalize",
    },
    {
        quote: "The multi-model optimization is a game-changer. One prompt, perfectly tuned for Claude and GPT-4 in seconds. Highly recommended.",
        name: "Marcus Thorne",
        title: "Senior Developer",
        company: "DevStream",
    },
    {
        quote: "The ROI was clear within the first week. We're spending less money and getting better results. It's that simple.",
        name: "Elena Rodriguez",
        title: "Product Manager",
        company: "Buildly",
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-background">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                        Loved by AI-Powered Teams
                    </h2>
                    <p className="text-muted-foreground text-lg italic">
                        See why companies trust Eloquo to maximize their AI potential.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, index) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-muted/30 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="pt-8">
                                    <div className="flex space-x-1 text-primary mb-6">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-current" />
                                        ))}
                                    </div>
                                    <blockquote className="text-lg leading-relaxed mb-8 italic">
                                        &quot;{t.quote}&quot;
                                    </blockquote>
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{t.name}</div>
                                            <div className="text-xs text-muted-foreground">{t.title}, {t.company}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
