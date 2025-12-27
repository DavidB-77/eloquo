"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Zap, Target, Sparkles, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_SCENARIO = [
    {
        input: 'Write a blog post about why businesses should use AI for marketing. Make it interesting and use some keywords. Keep it under 500 words.',
        optimized: {
            role: 'Expert Content Strategist',
            context: 'B2B SaaS adoption trends',
            task: 'Write a high-conversion 500-word blog post about AI in marketing',
            style: 'Professional, analytical, authoritative',
            constraints: 'Use semantic keywords [AI ROI, marketing automation]'
        },
        metrics: {
            match: '98.4%',
            efficiency: '32%'
        }
    },
    {
        input: 'Create a python script to scrape data from a website. It needs to be fast and handle errors well.',
        optimized: {
            role: 'Senior Python Engineer',
            context: 'Web scraping best practices',
            task: 'Develop a robust Python scraper using asyncio and aiohttp',
            style: 'PEP-8 compliant, highly optimized',
            constraints: 'Implement exponential backoff, user-agent rotation, error logging'
        },
        metrics: {
            match: '99.1%',
            efficiency: '45%'
        }
    }
];

export function BeforeAfterSection() {
    const [scenarioIndex, setScenarioIndex] = React.useState(0);
    const [phase, setPhase] = React.useState<"input" | "processing" | "results">("input");
    const [inputText, setInputText] = React.useState("");

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const currentScenario = DEMO_SCENARIO[scenarioIndex];

        const runSequence = async () => {
            // PHASE 1: INPUT TYPING (approx 4s)
            setPhase("input");
            setInputText("");

            for (let i = 0; i <= currentScenario.input.length; i++) {
                await new Promise(r => {
                    timeoutId = setTimeout(r, 20);
                }); // Typing speed
                setInputText(currentScenario.input.slice(0, i));
            }

            await new Promise(r => {
                timeoutId = setTimeout(r, 800);
            }); // Pause before click

            // PHASE 2: PROCESSING (3s)
            setPhase("processing");
            await new Promise(r => {
                timeoutId = setTimeout(r, 2500);
            });

            // PHASE 3: RESULTS (6s)
            setPhase("results");
            await new Promise(r => {
                timeoutId = setTimeout(r, 6000);
            });

            // RESET
            setScenarioIndex(prev => (prev + 1) % DEMO_SCENARIO.length);
        };

        runSequence();

        return () => clearTimeout(timeoutId);
    }, [scenarioIndex]);

    const currentScenario = DEMO_SCENARIO[scenarioIndex];

    return (
        <section id="optimization-comparison" className="py-32 relative overflow-hidden scroll-mt-20">
            <Container>
                <div className="compare-header text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Optimization <span className="text-electric-cyan italic">Comparison</span>
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        Compare a standard raw prompt with an Eloquo-optimized sequence. Precision and quality are the ultimate leverages.
                    </p>
                </div>

                <div className="relative">
                    {/* Simplified Grid Presentation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch min-h-[500px]">

                        {/* LEFT: RAW INPUT */}
                        <div className="transition-all duration-700">
                            <Card className={cn(
                                "h-full glass bg-deep-teal/5 border-white/5 p-6 transition-all duration-500",
                                phase === 'results' ? "opacity-50 grayscale" : "opacity-100"
                            )}>
                                <CardHeader className="flex flex-row items-center justify-between pb-8">
                                    <CardTitle className="text-white/40 font-display uppercase tracking-widest text-sm">Raw Input</CardTitle>
                                    <Badge variant="outline" className="opacity-30 text-[8px] uppercase tracking-widest border-white/20 text-white leading-none">Unrefined</Badge>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-midnight/60 border border-white/5 p-6 rounded-2xl font-mono text-xs leading-relaxed text-white/60 italic h-40">
                                        {/* Typing Effect */}
                                        {phase === 'input' ? (
                                            <>
                                                {inputText}
                                                <span className="inline-block w-2 h-4 bg-electric-cyan ml-1 animate-pulse" />
                                            </>
                                        ) : (
                                            currentScenario.input
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">
                                            <span>Processing Status</span>
                                            <span>{phase === 'input' ? 'Waiting' : phase === 'processing' ? 'Optimizing...' : 'Completed'}</span>
                                        </div>
                                        {/* Fake Progress Bar */}
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full bg-electric-cyan transition-all duration-300 ease-out",
                                                    phase === 'input' ? 'w-[5%]' : phase === 'processing' ? 'w-[60%] animate-pulse' : 'w-full')}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT: OPTIMIZED OUTPUT */}
                        <div className="relative">
                            {/* Loading Overlay */}
                            <div className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center z-20 transition-opacity duration-500",
                                phase === 'processing' ? "opacity-100" : "opacity-0 pointer-events-none"
                            )}>
                                <div className="h-16 w-16 border-2 border-electric-cyan border-t-transparent rounded-full animate-spin mb-6" />
                                <span className="text-electric-cyan font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Initializing Protocol...</span>
                            </div>

                            {/* Result Card */}
                            <Card className={cn(
                                "h-full glass bg-electric-cyan/5 border-electric-cyan/20 p-6 shadow-[0_0_50px_rgba(9,183,180,0.1)] relative overflow-hidden transition-all duration-700 transform",
                                phase === 'results' ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
                            )}>
                                <div className="absolute top-0 right-0 p-6">
                                    <Zap className="h-6 w-6 text-electric-cyan animate-pulse glow-sm" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-8">
                                    <CardTitle className="text-electric-cyan font-display uppercase tracking-widest text-sm">Eloquo Optimized</CardTitle>
                                    <Badge className="text-[8px] bg-electric-cyan text-midnight font-bold uppercase tracking-widest border-none leading-none">Peak Output</Badge>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-midnight/80 border border-electric-cyan/20 p-6 rounded-2xl font-mono text-xs leading-relaxed text-white/90 shadow-inner">
                                        <div className="mb-2"><span className="text-electric-cyan font-bold"># Role:</span> {currentScenario.optimized.role}</div>
                                        <div className="mb-2"><span className="text-electric-cyan font-bold"># Context:</span> {currentScenario.optimized.context}</div>
                                        <div className="mb-2"><span className="text-electric-cyan font-bold"># Task:</span> {currentScenario.optimized.task}</div>
                                        <div className="mb-2"><span className="text-electric-cyan font-bold"># Style:</span> {currentScenario.optimized.style}</div>
                                        <div className="mb-2"><span className="text-electric-cyan font-bold"># Constraints:</span> {currentScenario.optimized.constraints}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 border border-electric-cyan/10 bg-electric-cyan/5 rounded-xl">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-electric-cyan/40 font-bold mb-2">Success Rate</div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                                {currentScenario.metrics.match} <Check className="h-3 w-3 text-electric-cyan" />
                                            </div>
                                        </div>
                                        <div className="p-4 border border-electric-cyan/10 bg-electric-cyan/5 rounded-xl">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-electric-cyan/40 font-bold mb-2">Token Savings</div>
                                            <div className="text-sm font-bold text-electric-cyan">{currentScenario.metrics.efficiency} Efficiency</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>

                <div className="compare-footer mt-20 flex flex-wrap items-center justify-center gap-6">
                    <div className="glass border-electric-cyan/10 rounded-full px-8 py-4 flex items-center space-x-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        <div className="flex items-center space-x-3 group">
                            <Target className="h-4 w-4 text-electric-cyan group-hover:scale-125 transition-transform" />
                            <span>Extreme Consistency</span>
                        </div>
                        <div className="w-px h-4 bg-white/5" />
                        <div className="flex items-center space-x-3 group">
                            <Target className="h-4 w-4 text-electric-cyan group-hover:scale-125 transition-transform" />
                            <span>Cost Optimization</span>
                        </div>
                        <div className="w-px h-4 bg-white/5" />
                        <div className="flex items-center space-x-3 group">
                            <Target className="h-4 w-4 text-electric-cyan group-hover:scale-125 transition-transform" />
                            <span>Model Agnostic</span>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
