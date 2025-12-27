import * as React from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles, Users, Building2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const PRICING_PLANS = [
    {
        id: "free",
        name: "Free",
        price: "0",
        description: "Perfect for exploring AI optimization.",
        icon: Sparkles,
        features: [
            "10 optimizations / month",
            "Basic prompt analysis",
            "Universal model support",
            "Email support",
        ],
        cta: "Start Free",
        variant: "outline",
    },
    {
        id: "pro",
        name: "Pro",
        price: "29",
        description: "For individuals and power users.",
        icon: Sparkles,
        features: [
            "1,000 optimizations / month",
            "100 premium credits",
            "Advanced orchestration",
            "MCP / IDE integration",
            "Priority support",
            "Full history access",
        ],
        cta: "Get Pro",
        variant: "default",
        popular: true,
    },
    {
        id: "team",
        name: "Team",
        price: "99",
        description: "Best for collaborative teams.",
        icon: Users,
        features: [
            "5,000 optimizations / month",
            "500 premium credits",
            "Everything in Pro",
            "Up to 10 team members",
            "Shared prompt library",
            "Dedicated support",
        ],
        cta: "Get Team",
        variant: "outline",
    },
];

const ENTERPRISE_PLAN = {
    id: "enterprise",
    name: "Enterprise",
    price: "249",
    description: "Unlimited access for large organizations.",
    icon: Building2,
    features: [
        "Unlimited optimizations",
        "Unlimited premium credits",
        "Custom AI model routing",
        "SSO & advanced security",
        "Dedicated account manager",
        "Custom integrations",
    ],
};

export function PricingSection() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = React.useState(true);
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

    const handleCheckout = async (planId: string) => {
        if (planId === "free") {
            router.push("/signup");
            return;
        }

        setLoadingPlan(planId);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: planId,
                    billing: isAnnual ? "annual" : "monthly",
                }),
            });

            const data = await response.json();

            if (data.success && data.data?.checkoutUrl) {
                window.location.href = data.data.checkoutUrl;
            } else {
                // User not logged in, redirect to signup
                router.push(`/signup?plan=${planId}&billing=${isAnnual ? "annual" : "monthly"}`);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            router.push("/signup");
        } finally {
            setLoadingPlan(null);
        }
    };

    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from(".pricing-header > *", {
            scrollTrigger: {
                trigger: ".pricing-header",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.from(".pricing-card", {
            scrollTrigger: {
                trigger: ".pricing-grid",
                start: "top 80%",
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "expo.out"
        });

        gsap.from(".enterprise-card", {
            scrollTrigger: {
                trigger: ".enterprise-card",
                start: "top 90%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    }, { scope: sectionRef });

    return (
        <section id="pricing" ref={sectionRef} className="py-32 relative scroll-mt-20 overflow-hidden">
            <Container>
                <div className="pricing-header text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-normal font-display tracking-tight mb-6 text-white uppercase glow-sm">
                        Neural <span className="text-sunset-orange italic">Credits</span> Matrix
                    </h2>
                    <p className="text-dusty-rose text-lg max-w-2xl mx-auto mb-10 font-medium tracking-wide">
                        Choose the protocol that fits your frequency. Save 17% with annual initialization.
                    </p>

                    <div className="flex items-center justify-center space-x-6">
                        <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", !isAnnual ? "text-white" : "text-dusty-rose/40")}>Standard</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative h-7 w-14 rounded-full bg-deep-teal/40 border border-electric-cyan/20 transition-all focus:outline-none focus:ring-2 focus:ring-electric-cyan p-1 group"
                        >
                            <div
                                className={cn(
                                    "h-full aspect-square rounded-full bg-electric-cyan shadow-[0_0_10px_rgba(9,183,180,0.5)] transition-all duration-300",
                                    isAnnual ? "translate-x-7" : "translate-x-0"
                                )}
                            />
                        </button>
                        <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors flex items-center", isAnnual ? "text-white" : "text-dusty-rose/40")}>
                            Extended <Badge className="ml-2 px-2 py-0.5 text-[8px] bg-electric-cyan text-midnight font-bold border-none">SAVE 17%</Badge>
                        </span>
                    </div>
                </div>

                <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {PRICING_PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className="pricing-card"
                        >
                            <Card className={cn(
                                "relative flex flex-col h-full glass transition-all duration-500 border-electric-cyan/10 bg-deep-teal/5",
                                plan.popular && "border-electric-cyan/40 bg-deep-teal/10 shadow-[0_0_50px_rgba(9,183,180,0.1)] scale-105 z-10"
                            )}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge className="px-4 py-1 bg-electric-cyan text-midnight font-bold tracking-widest text-[10px] uppercase border-none">CORE PROTOCOL</Badge>
                                    </div>
                                )}
                                <CardHeader className="pt-10 pb-6 px-8">
                                    <CardTitle className="text-2xl font-display uppercase tracking-widest text-white">{plan.name}</CardTitle>
                                    <div className="mt-6 flex items-baseline">
                                        <span className="text-2xl font-display text-electric-cyan">$</span>
                                        <span className="text-6xl font-display text-white ml-1">
                                            {isAnnual ? Math.round(parseInt(plan.price) * 0.83) : plan.price}
                                        </span>
                                        <span className="ml-2 text-xs font-bold text-dusty-rose/60 uppercase tracking-widest">/cycle</span>
                                    </div>
                                    <p className="mt-6 text-dusty-rose/80 text-sm font-medium leading-relaxed">
                                        {plan.description}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1 px-8 pb-10">
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start text-sm group/item">
                                                <div className="mr-3 mt-1 h-3 w-3 rounded-sm border border-electric-cyan/40 flex items-center justify-center group-hover/item:border-electric-cyan transition-colors">
                                                    <Check className="h-2 w-2 text-electric-cyan opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-dusty-rose/80 font-medium group-hover/item:text-white transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="px-8 pb-10">
                                    <Button
                                        className={cn(
                                            "w-full h-12 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all",
                                            plan.popular ? "btn-gradient text-white glow-sm hover:glow-md" : "border-electric-cyan/20 text-white hover:bg-electric-cyan/5 border"
                                        )}
                                        variant={plan.popular ? "default" : "outline"}
                                        onClick={() => handleCheckout(plan.id)}
                                        isLoading={loadingPlan === plan.id}
                                    >
                                        {plan.cta}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Enterprise Section */}
                <div className="enterprise-card group">
                    <Card className="glass bg-gradient-to-r from-deep-teal/20 to-midnight border-electric-cyan/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Building2 className="h-48 w-48 text-electric-cyan" />
                        </div>
                        <CardContent className="py-12 px-10 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="flex items-center space-x-6">
                                    <div className="h-20 w-20 rounded-2xl bg-deep-teal/40 border border-electric-cyan/20 text-electric-cyan flex items-center justify-center shadow-[0_0_30px_rgba(9,183,180,0.2)]">
                                        <Building2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-display text-white uppercase tracking-widest leading-none mb-4">{ENTERPRISE_PLAN.name} Protocol</h3>
                                        <p className="text-dusty-rose text-lg font-medium">{ENTERPRISE_PLAN.description}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="text-center md:text-right">
                                        <div className="text-4xl font-display text-white mb-1">
                                            <span className="text-2xl text-electric-cyan">$</span>
                                            {isAnnual ? Math.round(249 * 0.83) : 249}
                                            <span className="text-xs font-bold text-dusty-rose/60 uppercase tracking-widest ml-2">/cycle</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-electric-cyan uppercase tracking-widest">Base Initialization</p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="h-14 px-10 rounded-xl btn-gradient text-xs font-bold uppercase tracking-[0.2em] glow-sm hover:glow-md transition-all"
                                        onClick={() => handleCheckout("enterprise")}
                                        isLoading={loadingPlan === "enterprise"}
                                    >
                                        Initialize Link
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 pt-10 border-t border-electric-cyan/10">
                                {ENTERPRISE_PLAN.features.map((feature) => (
                                    <div key={feature} className="flex items-center text-sm group/item">
                                        <Check className="mr-3 h-4 w-4 text-electric-cyan" />
                                        <span className="text-dusty-rose/80 font-medium group-hover:text-white transition-colors">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-20 text-center">
                    <div className="inline-flex items-center space-x-3 text-dusty-rose/40 text-[10px] font-bold tracking-[0.3em] uppercase">
                        <Zap className="h-4 w-4 fill-current text-electric-cyan" />
                        <span>All operations secure & encrypted</span>
                    </div>
                </div>
            </Container>
        </section>
    );
}
