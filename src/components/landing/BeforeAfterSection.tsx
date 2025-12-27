import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Zap, Target } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function BeforeAfterSection() {
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".compare-header > *", {
            scrollTrigger: {
                trigger: ".compare-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".compare-col", {
            scrollTrigger: {
                trigger: ".compare-grid",
                start: "top 80%",
            },
            x: (i) => i === 0 ? -50 : 50,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "expo.out"
        });

        gsap.from(".compare-footer > *", {
            scrollTrigger: {
                trigger: ".compare-footer",
                start: "top 90%",
            },
            scale: 0.95,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "back.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-32 relative overflow-hidden">
            <Container>
                <div className="compare-header text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-normal font-display tracking-tight mb-6 text-white uppercase glow-sm">
                        Protocol <span className="text-electric-cyan italic">Comparison</span>
                    </h2>
                    <p className="text-dusty-rose text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        Compare a standard prompt with an Eloquo-optimized sequence. Precision is the ultimate leverage.
                    </p>
                </div>

                <div className="compare-grid grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                    {/* Before Column */}
                    <div className="compare-col">
                        <Card className="h-full glass bg-deep-teal/5 border-white/5 p-4 transition-all duration-500 hover:border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between pb-8">
                                <CardTitle className="text-dusty-rose/40 font-display uppercase tracking-widest text-sm">Raw Input</CardTitle>
                                <Badge variant="outline" className="opacity-30 text-[8px] uppercase tracking-widest border-white/20 text-white leading-none">Unrefined</Badge>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-midnight/60 border border-white/5 p-6 rounded-2xl font-mono text-xs leading-relaxed text-dusty-rose/40 italic">
                                    &quot;Write a blog post about why businesses should use AI for marketing.
                                    Make it interesting and use some keywords. Keep it under 500 words.&quot;
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 border border-white/5 bg-white/2 rounded-xl">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-dusty-rose/30 font-bold mb-2">Clarity Index</div>
                                        <div className="text-sm font-bold text-terracotta uppercase">Critical</div>
                                    </div>
                                    <div className="p-4 border border-white/5 bg-white/2 rounded-xl">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-dusty-rose/30 font-bold mb-2">Token Density</div>
                                        <div className="text-sm font-bold text-white">45 Units</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* After Column */}
                    <div className="compare-col">
                        <Card className="h-full glass bg-electric-cyan/5 border-electric-cyan/20 p-4 shadow-[0_0_50px_rgba(9,183,180,0.1)] relative overflow-hidden transition-all duration-500 hover:border-electric-cyan/40">
                            <div className="absolute top-0 right-0 p-6">
                                <Zap className="h-6 w-6 text-electric-cyan animate-pulse glow-sm" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-8">
                                <CardTitle className="text-electric-cyan font-display uppercase tracking-widest text-sm">Eloquo Optimized</CardTitle>
                                <Badge className="text-[8px] bg-electric-cyan text-midnight font-bold uppercase tracking-widest border-none leading-none">Peak Output</Badge>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-midnight/80 border border-electric-cyan/20 p-6 rounded-2xl font-mono text-xs leading-relaxed text-white/90 shadow-inner">
                                    <span className="text-electric-cyan font-bold"># Role:</span> Expert Content Strategist<br />
                                    <span className="text-electric-cyan font-bold"># Context:</span> B2B SaaS adoption trends<br />
                                    <span className="text-electric-cyan font-bold"># Task:</span> Write a high-conversion 500-word blog post...<br />
                                    <span className="text-electric-cyan font-bold"># Style:</span> Professional, analytical, authoritative<br />
                                    <span className="text-electric-cyan font-bold"># Constraints:</span> Use semantic keywords [AI ROI, marketing automation]...
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-4 border border-electric-cyan/10 bg-electric-cyan/5 rounded-xl">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-electric-cyan/40 font-bold mb-2">Success Rate</div>
                                        <div className="text-sm font-bold text-white">98.4% Match</div>
                                    </div>
                                    <div className="p-4 border border-electric-cyan/10 bg-electric-cyan/5 rounded-xl">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-electric-cyan/40 font-bold mb-2">Token Savings</div>
                                        <div className="text-sm font-bold text-electric-cyan">32% Efficiency</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="compare-footer mt-20 flex flex-wrap items-center justify-center gap-6">
                    <div className="glass border-electric-cyan/10 rounded-full px-8 py-4 flex items-center space-x-8 text-[10px] font-bold uppercase tracking-[0.2em] text-dusty-rose/60">
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
