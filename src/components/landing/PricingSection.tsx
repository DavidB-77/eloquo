"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles, Zap, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    PricingConfig,
    FoundingMemberConfig,
    AnnualDiscountConfig,
    getPricingConfig,
    getFoundingMemberConfig,
    getAnnualDiscountConfig
} from "@/lib/settings";
import { FoundingMemberModal } from "./FoundingMemberModal";

gsap.registerPlugin(ScrollTrigger);

export function PricingSection() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = React.useState(false); // Default to Monthly per user request logic (Wait, prompt said "Default: Monthly selected")
    // Re-reading prompt: "Default: Monthly selected"

    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
    const [pricing, setPricing] = React.useState<PricingConfig | null>(null);
    const [founding, setFounding] = React.useState<FoundingMemberConfig | null>(null);
    const [annualConfig, setAnnualConfig] = React.useState<AnnualDiscountConfig | null>(null);

    React.useEffect(() => {
        async function loadSettings() {
            const p = await getPricingConfig();
            const f = await getFoundingMemberConfig();
            const a = await getAnnualDiscountConfig();
            setPricing(p);
            setFounding(f);
            setAnnualConfig(a);
        }
        loadSettings();
    }, []);

    const sectionRef = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!pricing) return; // Wait for data

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
                start: "top 85%",
            },
            y: 80,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

    }, { scope: sectionRef, dependencies: [pricing] });

    const handleCheckout = async (planId: string) => {
        setLoadingPlan(planId);
        try {
            // Mock checkout or real flow
            router.push(`/signup?plan=${planId}&billing=${isAnnual ? "annual" : "monthly"}`);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPlan(null);
        }
    };

    if (!pricing || !founding || !annualConfig) {
        return <div className="py-40 text-center text-white/40">Loading pricing configuration...</div>;
    }

    // Calculate Founding Status
    let currentWaveIndex = 0;
    let accumSpots = 0;
    const { current_count, waves } = founding;

    // Find active wave
    for (let i = 0; i < waves.length; i++) {
        if (current_count < accumSpots + waves[i].spots) {
            currentWaveIndex = i;
            break;
        }
        accumSpots += waves[i].spots;
    }
    const currentWave = waves[currentWaveIndex];
    const spotsLeftInWave = currentWave.spots - (current_count - accumSpots);

    // Helper to get price display
    const getPriceDisplay = (tierKey: keyof PricingConfig, tierName: string) => {
        const tier = pricing[tierKey];
        const isFoundingEligible = founding.enabled && founding.applies_to.includes(tierKey);

        // Base prices
        let monthly = tier.monthly_price;
        let annualTotal = tier.annual_price;

        let originalMonthly = null;
        let originalAnnualTotal = null;

        let isFoundingPrice = false;

        // Apply Founding Logic
        if (isFoundingEligible && currentWave) {
            let foundMonthly = 0;
            if (tierKey === 'pro') foundMonthly = currentWave.pro_price;
            if (tierKey === 'business') foundMonthly = currentWave.business_price;

            if (foundMonthly > 0) {
                isFoundingPrice = true;
                originalMonthly = monthly;
                originalAnnualTotal = annualTotal;

                monthly = foundMonthly;
                // Annual founding price is just 12 * monthly founding price (standard practice, or could be further discounted)
                // Prompt request said: "Pro: $108/year (show $150 with strikethrough)" which implies 12 * $9
                annualTotal = foundMonthly * 12;
            }
        }

        return {
            amount: isAnnual ? (annualTotal / 12).toFixed(2) : monthly.toFixed(0),
            originalAmount: isAnnual ? (originalAnnualTotal ? (originalAnnualTotal / 12).toFixed(2) : null) : originalMonthly,
            isFounding: isFoundingPrice,
            period: '/mo',
            totalAnnual: isAnnual ? annualTotal : null,
            originalTotalAnnual: isAnnual ? originalAnnualTotal : null
        };
    };

    return (
        <section id="pricing" ref={sectionRef} className="py-32 relative scroll-mt-20 overflow-hidden">
            {founding.enabled && (
                <FoundingMemberModal config={founding} />
            )}

            <Container>
                {/* Founding Member Banner */}
                {founding.enabled && currentWave && (
                    <div className="max-w-4xl mx-auto mb-12 animate-pulse">
                        <div className="bg-gradient-to-r from-neon-orange/20 to-midnight border border-neon-orange/40 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left shadow-[0_0_30px_rgba(229,120,68,0.2)]">
                            <div>
                                <h3 className="text-neon-orange font-bold font-display uppercase tracking-widest text-sm md:text-base mb-2">
                                    🚀 Founding Member Special - Wave {currentWave.wave} ({spotsLeftInWave} of {currentWave.spots} spots remaining)
                                </h3>
                                <p className="text-white/60 text-xs md:text-sm">
                                    Lock in discounted pricing <span className="text-white font-bold">FOREVER</span>. Price never increases as long as you stay subscribed.
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col md:items-end text-xs font-mono text-white/40">
                                <div>Pro: <span className="text-white font-bold">${currentWave.pro_price}/mo</span> <span className="line-through decoration-neon-orange">Regular ${pricing.pro.monthly_price}</span></div>
                                <div>Business: <span className="text-white font-bold">${currentWave.business_price}/mo</span> <span className="line-through decoration-neon-orange">Regular ${pricing.business.monthly_price}</span></div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pricing-header text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-normal font-display mb-6 text-white uppercase glow-sm">
                        Protocol <span className="text-electric-cyan italic">Optimization</span> Matrix
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 font-medium tracking-wide">
                        Choose the protocol that fits your frequency.
                    </p>

                    {/* Checkbox Toggle */}
                    <div className="flex items-center justify-center space-x-6 select-none">
                        <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer", !isAnnual ? "text-white" : "text-white/40")} onClick={() => setIsAnnual(false)}>Monthly</span>
                        <div
                            className="relative h-8 w-16 rounded-full bg-deep-teal/40 border border-electric-cyan/20 cursor-pointer p-1 transition-colors hover:border-electric-cyan/40"
                            onClick={() => setIsAnnual(!isAnnual)}
                        >
                            <div className={cn(
                                "h-full w-[45%] rounded-full bg-electric-cyan shadow-md transition-all duration-300",
                                isAnnual ? "translate-x-[110%]" : "translate-x-0"
                            )} />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors flex items-center cursor-pointer", isAnnual ? "text-white" : "text-white/40")} onClick={() => setIsAnnual(true)}>
                            Annual <Badge className="ml-2 px-1.5 py-0.5 text-[8px] bg-electric-cyan text-midnight font-bold border-none">SAVE {annualConfig.percent}%</Badge>
                        </span>
                    </div>
                </div>

                <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-8 mb-16 items-start">
                    {/* BASIC TIER */}
                    <PricingCard
                        name="Basic"
                        tierKey="basic"
                        priceDetails={getPriceDisplay('basic', 'Basic')}
                        features={[
                            `${pricing.basic.optimizations} optimizations/month`,
                            "All AI models (GPT-4, Claude 3, Gemini)",
                            "Web dashboard access",
                            `${pricing.basic.history_days}-day prompt history`,
                            "Email support",
                            "NO MCP/API access"
                        ]}
                        cta="Initialize Basic"
                        loading={loadingPlan === 'basic'}
                        onCheckout={() => handleCheckout('basic')}
                    />

                    {/* PRO TIER */}
                    <PricingCard
                        name="Pro"
                        tierKey="pro"
                        popular
                        priceDetails={getPriceDisplay('pro', 'Pro')}
                        features={[
                            `${pricing.pro.optimizations} optimizations/month`,
                            "All AI models",
                            "Web dashboard access",
                            `${pricing.pro.history_days}-day prompt history`,
                            "Priority support",
                            "MCP Server Access",
                            "Full API Access"
                        ]}
                        cta="Initialize Pro"
                        loading={loadingPlan === 'pro'}
                        onCheckout={() => handleCheckout('pro')}
                    />

                    {/* BUSINESS TIER */}
                    <PricingCard
                        name="Business"
                        tierKey="business"
                        priceDetails={getPriceDisplay('business', 'Business')}
                        features={[
                            `${pricing.business.optimizations} optimizations/month`,
                            "All AI models",
                            "Web dashboard access",
                            "Unlimited prompt history",
                            "Dedicated support",
                            "MCP Server Access",
                            "Full API Access",
                            "Priority processing queue"
                        ]}
                        cta="Initialize Business"
                        loading={loadingPlan === 'business'}
                        onCheckout={() => handleCheckout('business')}
                    />
                </div>

                <div className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                    Values calculated based on standard generation costs
                </div>
            </Container>
        </section>
    );
}

function PricingCard({ name, tierKey, popular, priceDetails, features, cta, loading, onCheckout }: any) {
    return (
        <div className={cn("pricing-card h-full", popular && "-mt-4 mb-4")}>
            <Card className={cn(
                "relative flex flex-col h-full glass transition-all duration-500 border-electric-cyan/10 bg-midnight/60 overflow-visible",
                popular && "border-electric-cyan/40 bg-midnight/80 shadow-[0_0_60px_rgba(0,255,255,0.15)] z-10"
            )}>
                {popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="px-4 py-1 bg-electric-cyan text-midnight font-bold tracking-widest text-[10px] uppercase border-none hover:bg-electric-cyan">MOST POPULAR</Badge>
                    </div>
                )}

                <CardHeader className="pt-10 pb-6 px-8 text-center md:text-left">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-display uppercase tracking-widest text-white">{name}</CardTitle>
                        {priceDetails.isFounding && (
                            <Badge className="bg-neon-orange/20 text-neon-orange border border-neon-orange/40 text-[9px] uppercase tracking-wider">Founding</Badge>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="flex items-baseline">
                            <span className="text-xl font-display text-electric-cyan">$</span>
                            <span className={cn("font-display text-white ml-1", priceDetails.amount.length > 3 ? "text-5xl" : "text-6xl")}>
                                {priceDetails.amount}
                            </span>
                            <span className="ml-2 text-xs font-bold text-white/40 uppercase tracking-widest">/mo</span>
                        </div>

                        {priceDetails.originalAmount && (
                            <div className="mt-1 text-xs text-neon-orange line-through decoration-neon-orange/50 font-medium">
                                Regular price: ${priceDetails.originalAmount}/mo
                            </div>
                        )}

                        {priceDetails.totalAnnual && (
                            <div className="mt-1 text-xs text-white/30 font-mono">
                                Billed ${priceDetails.totalAnnual} yearly
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 px-8 pb-10">
                    <div className="h-px w-full bg-gradient-to-r from-electric-cyan/30 to-transparent mb-6" />
                    <ul className="space-y-4">
                        {features.map((feature: string, i: number) => {
                            const isIncluded = !feature.startsWith("NO ");
                            return (
                                <li key={i} className="flex items-start text-sm group/item">
                                    <div className={cn(
                                        "mr-3 mt-1 h-3 w-3 rounded-sm flex items-center justify-center transition-colors",
                                        isIncluded ? "border border-electric-cyan/40 group-hover/item:border-electric-cyan" : "opacity-30"
                                    )}>
                                        {isIncluded && <Check className="h-2 w-2 text-electric-cyan opacity-0 group-hover/item:opacity-100 transition-opacity" />}
                                    </div>
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        isIncluded ? "text-white/60 group-hover/item:text-white" : "text-white/20 line-through"
                                    )}>{feature.replace("NO ", "")}</span>
                                </li>
                            )
                        })}
                    </ul>
                </CardContent>

                <CardFooter className="px-8 pb-10">
                    <Button
                        className={cn(
                            "w-full h-12 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all",
                            popular ? "btn-gradient text-white glow-sm hover:glow-md" : "border-electric-cyan/20 text-white hover:bg-electric-cyan/5 border"
                        )}
                        variant={popular ? "default" : "outline"}
                        onClick={onCheckout}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : (
                            cta
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
