"use client";

import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Zap, Target } from "lucide-react";

export function BeforeAfterSection() {
    return (
        <section className="py-24 bg-muted/20">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                        See the Difference
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Compare a standard prompt with an Eloquo-optimized version. Precision matters.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Before Column */}
                    <Card className="border-muted bg-background/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-muted-foreground">Original Prompt</CardTitle>
                            <Badge variant="outline" className="opacity-70 text-[10px]">Unoptimized</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg font-mono text-xs leading-relaxed text-muted-foreground">
                                &quot;Write a blog post about why businesses should use AI for marketing.
                                Make it interesting and use some keywords. Keep it under 500 words.&quot;
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border rounded-lg">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Clarity</div>
                                    <div className="text-sm font-semibold">Low</div>
                                </div>
                                <div className="p-3 border rounded-lg">
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Token Estimate</div>
                                    <div className="text-sm font-semibold">45 Tokens</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* After Column */}
                    <Card className="border-primary bg-primary/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <Zap className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-primary">Optimized Result</CardTitle>
                            <Badge variant="default" className="text-[10px] bg-primary">Best Performance</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-background border border-primary/20 p-4 rounded-lg font-mono text-xs leading-relaxed">
                                <span className="text-primary font-bold"># Role:</span> Expert Content Strategist<br />
                                <span className="text-primary font-bold"># Context:</span> B2B SaaS adoption trends<br />
                                <span className="text-primary font-bold"># Task:</span> Write a high-conversion 500-word blog post...<br />
                                <span className="text-primary font-bold"># Style:</span> Professional, analytical, authoritative<br />
                                <span className="text-primary font-bold"># Constraints:</span> Use semantic keywords [AI ROI, marketing automation]...
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border border-primary/20 bg-primary/10 rounded-lg">
                                    <div className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Success Rate</div>
                                    <div className="text-sm font-semibold text-primary">98% Match</div>
                                </div>
                                <div className="p-3 border border-primary/20 bg-primary/10 rounded-lg">
                                    <div className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Tokens Saved</div>
                                    <div className="text-sm font-semibold text-primary">32% Efficiency Gain</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-12 flex items-center justify-center">
                    <div className="bg-background border rounded-full px-6 py-3 shadow-sm flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-success" />
                            <span>Better Consistency</span>
                        </div>
                        <div className="w-px h-4 bg-muted" />
                        <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-success" />
                            <span>Lower API Costs</span>
                        </div>
                        <div className="w-px h-4 bg-muted" />
                        <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-success" />
                            <span>Model Agnostic</span>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
