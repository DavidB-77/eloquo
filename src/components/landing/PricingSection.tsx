"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
    {
        name: "Basic",
        key: "basic",
        monthlyPrice: 7,
        foundingPrice: null, // No founding discount for Basic
        credits: 150,
        popular: false,
        features: [
            { text: "150 optimizations/month", included: true },
            { text: "Full Adaptive AI (learns from your ratings)", included: true },
            { text: "6-month prompt history", included: true },
            { text: "Export your library (JSON/CSV)", included: true },
            { text: "Web dashboard", included: true },
            { text: "Email support", included: true },
            { text: "MCP Server Access", included: false },
            { text: "API Access", included: false },
        ],
        cta: "Get Started",
    },
    {
        name: "Pro",
        key: "pro",
        monthlyPrice: 15,
        foundingPrice: 9,
        credits: 400,
        popular: true,
        features: [
            { text: "400 optimizations/month", included: true },
            { text: "Full Adaptive AI", included: true },
            { text: "1-year prompt history", included: true },
            { text: "Export your library", included: true },
            { text: "MCP Server Access ⓘ", included: true, tooltip: "Works with Claude Desktop, Cursor, Windsurf & more" },
            { text: "Full API Access", included: true },
            { text: "Priority support", included: true },
        ],
        cta: "Get Started",
    },
    {
        name: "Business",
        key: "business",
        monthlyPrice: 35,
        foundingPrice: 20,
        credits: 1000,
        popular: false,
        features: [
            { text: "1000 optimizations/month", included: true },
            { text: "Full Adaptive AI", included: true },
            { text: "Unlimited prompt history", included: true },
            { text: "Bulk export", included: true },
            { text: "MCP Server Access", included: true },
            { text: "Full API Access", included: true },
            { text: "Priority processing", included: true },
            { text: "Dedicated support", included: true },
        ],
        cta: "Get Started",
    },
];

export function PricingSection() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = React.useState(false);
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

    const handleCheckout = async (planKey: string) => {
        setLoadingPlan(planKey);
        try {
            // Check if user is authenticated by trying to call checkout
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: planKey,
                    billing: isAnnual ? 'annual' : 'monthly'
                }),
            });
            const data = await res.json();

            if (data.success && data.checkoutUrl) {
                // User is logged in - redirect to checkout
                window.location.href = data.checkoutUrl;
            } else if (res.status === 401) {
                // Not logged in - redirect to signup
                router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
            } else {
                console.error('Checkout failed:', data.error);
                // Fallback to signup
                router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            // Fallback to signup
            router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section id="pricing" className="py-32 relative scroll-mt-20 overflow-hidden">
            <Container>
                {/* Founding Member Banner */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="bg-gradient-to-r from-sunset-orange/20 to-midnight border border-sunset-orange/40 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left shadow-[0_0_30px_rgba(229,120,68,0.2)]">
                        <div>
                            <h3 className="text-sunset-orange font-bold font-display uppercase tracking-widest text-sm md:text-base mb-2">
                                🚀 Founding Member Special - Limited Spots Available
                            </h3>
                            <p className="text-white/60 text-xs md:text-sm">
                                Lock in discounted pricing <span className="text-white font-bold">FOREVER</span>. Price never increases as long as you stay subscribed.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col md:items-end text-xs font-mono text-white/40">
                            <div>Pro: <span className="text-white font-bold">$9/mo</span> <span className="line-through decoration-sunset-orange">Regular $15</span></div>
                            <div>Business: <span className="text-white font-bold">$20/mo</span> <span className="line-through decoration-sunset-orange">Regular $35</span></div>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Protocol <span className="text-electric-cyan italic">Optimization</span> Matrix
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 font-medium tracking-wide">
                        Choose the protocol that fits your frequency.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center space-x-6 select-none">
                        <span
                            className={cn("text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer", !isAnnual ? "text-white" : "text-white/40")}
                            onClick={() => setIsAnnual(false)}
                        >
                            Monthly
                        </span>
                        <div
                            className="relative h-8 w-16 rounded-full bg-deep-teal/40 border border-electric-cyan/20 cursor-pointer p-1 transition-colors hover:border-electric-cyan/40"
                            onClick={() => setIsAnnual(!isAnnual)}
                        >
                            <div className={cn(
                                "h-full w-[45%] rounded-full bg-electric-cyan shadow-md transition-all duration-300",
                                isAnnual ? "translate-x-[110%]" : "translate-x-0"
                            )} />
                        </div>
                        <span
                            className={cn("text-xs font-bold uppercase tracking-widest transition-colors flex items-center cursor-pointer", isAnnual ? "text-white" : "text-white/40")}
                            onClick={() => setIsAnnual(true)}
                        >
                            Annual <Badge className="ml-2 px-1.5 py-0.5 text-[8px] bg-electric-cyan text-midnight font-bold border-none">SAVE 20%</Badge>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-8 mb-8 items-start">
                    {TIERS.map((tier) => {
                        const displayPrice = tier.foundingPrice || tier.monthlyPrice;
                        const annualPrice = Math.round(displayPrice * 12 * 0.8); // 20% off
                        const monthlyFromAnnual = (annualPrice / 12).toFixed(0);

                        return (
                            <div key={tier.key} className={cn("h-full", tier.popular && "-mt-4 mb-4")}>
                                <Card className={cn(
                                    "relative flex flex-col h-full glass transition-all duration-500 border-electric-cyan/10 bg-midnight/60 overflow-visible",
                                    tier.popular && "border-electric-cyan/40 bg-midnight/80 shadow-[0_0_60px_rgba(0,255,255,0.15)] z-10"
                                )}>
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="px-4 py-1 bg-electric-cyan text-midnight font-bold tracking-widest text-[10px] uppercase border-none hover:bg-electric-cyan">MOST POPULAR</Badge>
                                        </div>
                                    )}

                                    <CardHeader className="pt-10 pb-6 px-8 text-center md:text-left">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl font-display uppercase tracking-widest text-white">{tier.name}</CardTitle>
                                            {tier.foundingPrice && (
                                                <Badge className="bg-sunset-orange/20 text-sunset-orange border border-sunset-orange/40 text-[9px] uppercase tracking-wider">Founding</Badge>
                                            )}
                                        </div>

                                        <div className="mt-6">
                                            <div className="flex items-baseline">
                                                <span className="text-xl font-display text-electric-cyan">$</span>
                                                <span className="text-6xl font-display text-white ml-1">
                                                    {isAnnual ? monthlyFromAnnual : displayPrice}
                                                </span>
                                                <span className="ml-2 text-xs font-bold text-white/40 uppercase tracking-widest">/mo</span>
                                            </div>

                                            {tier.foundingPrice && (
                                                <div className="mt-1 text-xs text-sunset-orange line-through decoration-sunset-orange/50 font-medium">
                                                    Regular: ${tier.monthlyPrice}/mo
                                                </div>
                                            )}

                                            {isAnnual && (
                                                <div className="mt-1 text-xs text-white/30 font-mono">
                                                    Billed ${annualPrice} yearly
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 px-8 pb-10">
                                        <div className="h-px w-full bg-gradient-to-r from-electric-cyan/30 to-transparent mb-6" />
                                        <ul className="space-y-4">
                                            {tier.features.map((feature, i) => (
                                                <li key={i} className="flex items-start text-sm group/item">
                                                    <div className={cn(
                                                        "mr-3 mt-1 h-3 w-3 rounded-sm flex items-center justify-center transition-colors",
                                                        feature.included ? "border border-electric-cyan/40 group-hover/item:border-electric-cyan" : "opacity-30"
                                                    )}>
                                                        {feature.included ? (
                                                            <Check className="h-2 w-2 text-electric-cyan opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                        ) : (
                                                            <X className="h-2 w-2 text-white/30" />
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "font-medium transition-colors",
                                                        feature.included ? "text-white/60 group-hover/item:text-white" : "text-white/20 line-through"
                                                    )}>{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter className="px-8 pb-10">
                                        <Button
                                            className={cn(
                                                "w-full h-12 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all",
                                                tier.popular ? "btn-gradient text-white glow-sm hover:glow-md" : "border-electric-cyan/20 text-white hover:bg-electric-cyan/5 border"
                                            )}
                                            variant={tier.popular ? "default" : "outline"}
                                            onClick={() => handleCheckout(tier.key)}
                                            disabled={loadingPlan === tier.key}
                                        >
                                            {loadingPlan === tier.key ? (
                                                <span className="animate-pulse">Processing...</span>
                                            ) : (
                                                tier.cta
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Credits Clarification */}
                <div className="text-center text-sm text-white/40 mt-8">
                    1 prompt optimization = 1 credit &nbsp;|&nbsp; Project Protocol = 5 credits
                </div>
            </Container>
        </section>
    );
}
