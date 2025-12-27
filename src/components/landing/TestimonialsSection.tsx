import * as React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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
    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".testi-header > *", {
            scrollTrigger: {
                trigger: ".testi-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".testi-card", {
            scrollTrigger: {
                trigger: ".testi-grid",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "expo.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-32 relative overflow-hidden">
            <Container>
                <div className="testi-header text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-normal font-display tracking-tight mb-6 text-white uppercase glow-sm">
                        Neural <span className="text-sunset-orange italic">Feedback</span> Loop
                    </h2>
                    <p className="text-dusty-rose text-lg max-w-2xl mx-auto font-medium tracking-wide">
                        See why elite operators trust Eloquo to maximize their AI potential.
                    </p>
                </div>

                <div className="testi-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t) => (
                        <div key={t.name} className="testi-card">
                            <Card className="h-full glass border-electric-cyan/10 bg-deep-teal/5 transition-all duration-500 hover:border-electric-cyan/30 group">
                                <CardContent className="pt-10 px-8 pb-10">
                                    <div className="flex space-x-1.5 text-electric-cyan mb-8">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className="h-3.5 w-3.5 fill-current shadow-[0_0_10px_rgba(9,183,180,0.4)]" />
                                        ))}
                                    </div>
                                    <blockquote className="text-lg leading-relaxed mb-10 text-white font-medium italic">
                                        &quot;{t.quote}&quot;
                                    </blockquote>
                                    <div className="flex items-center space-x-5 pt-6 border-t border-white/5">
                                        <div className="h-12 w-12 rounded-xl btn-gradient flex items-center justify-center font-display text-lg text-white shadow-[0_0_20px_rgba(9,183,180,0.3)] group-hover:shadow-[0_0_30px_rgba(9,183,180,0.5)] transition-all">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-display text-xs uppercase tracking-widest text-white mb-1">{t.name}</div>
                                            <div className="text-[10px] font-bold text-dusty-rose/60 uppercase tracking-[0.2em]">{t.title}, {t.company}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex items-center space-x-3 text-electric-cyan/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                        <Zap className="h-4 w-4 fill-current text-electric-cyan" />
                        <span>Verified Human Interaction</span>
                    </div>
                </div>
            </Container>
        </section>
    );
}
