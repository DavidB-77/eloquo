"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    PricingConfig as PricingConfigType,
    FoundingMemberConfig as FoundingMemberConfigType,
    AnnualDiscountConfig as AnnualDiscountConfigType,
    GeneralSettings as GeneralSettingsType
} from "@/lib/settings";

export function PricingSection() {
    const router = useRouter();
    const [isAnnual, setIsAnnual] = React.useState(false);
    const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

    // Fetch dynamic settings from Convex
    const settings = useQuery(api.settings.getAllPricingSettings);

    const pricingConfig = settings?.pricing as PricingConfigType | null;
    const foundingConfig = settings?.founding as FoundingMemberConfigType | null;
    const annualConfig = settings?.annual as AnnualDiscountConfigType | null;
    const generalSettings = settings?.general as GeneralSettingsType | null;

    // Use annual discount percentage from database
    const discountPercent = annualConfig?.percent || 20;

    // Build tiers dynamically
    const TIERS = React.useMemo(() => {
        if (!pricingConfig) return [];

        const getHistoryText = (days: number) => {
            if (days === 0) return "Unlimited prompt history";
            if (days >= 365) return "1-year prompt history";
            if (days >= 30) return `${Math.floor(days / 30)}-month prompt history`;
            return `${days}-day prompt history`;
        };

        const tiers = [
            {
                name: "Free",
                key: "free",
                monthlyPrice: 0,
                annualPrice: 0,
                credits: generalSettings?.free_tier_weekly_limit ? generalSettings.free_tier_weekly_limit * 4 : 12,
                popular: false,
                features: [
                    { text: `${generalSettings?.free_tier_weekly_limit || 3} optimizations per week`, included: true },
                    { text: "Standard AI models", included: true },
                    { text: "Basic prompt analysis", included: true },
                    { text: "Community support", included: true },
                    { text: "Prompt history", included: false },
                    { text: "Export library", included: false },
                    { text: "API Access", included: false },
                ],
                cta: "Start Free",
                foundingPrice: null,
            },
            {
                name: "Basic",
                key: "basic",
                monthlyPrice: pricingConfig.basic.monthly_price,
                annualPrice: pricingConfig.basic.annual_price || Math.round(pricingConfig.basic.monthly_price * 12 * (1 - discountPercent / 100)),
                credits: pricingConfig.basic.optimizations,
                popular: false,
                features: [
                    { text: `${pricingConfig.basic.optimizations} optimizations/month`, included: true },
                    { text: "Full Adaptive AI", included: true },
                    { text: getHistoryText(pricingConfig.basic.history_days), included: true },
                    { text: "Export your library", included: true },
                    { text: "Web dashboard", included: true },
                    { text: "Email support", included: true },
                    { text: "MCP Server Access", included: pricingConfig.basic.api_access },
                    { text: "API Access", included: pricingConfig.basic.api_access },
                ],
                cta: "Get Started",
                foundingPrice: null,
            },
            {
                name: "Pro",
                key: "pro",
                monthlyPrice: pricingConfig.pro.monthly_price,
                annualPrice: pricingConfig.pro.annual_price || Math.round(pricingConfig.pro.monthly_price * 12 * (1 - discountPercent / 100)),
                credits: pricingConfig.pro.optimizations,
                popular: true,
                features: [
                    { text: `${pricingConfig.pro.optimizations} optimizations/month`, included: true },
                    { text: "Full Adaptive AI", included: true },
                    { text: getHistoryText(pricingConfig.pro.history_days), included: true },
                    { text: "Export your library", included: true },
                    { text: "MCP Server Access ⓘ", included: pricingConfig.pro.api_access, tooltip: "Works with Claude Desktop, Cursor, Windsurf & more" },
                    { text: "Full API Access", included: pricingConfig.pro.api_access },
                    { text: "Priority support", included: true },
                ],
                cta: "Get Started",
                foundingPrice: (foundingConfig?.enabled && foundingConfig?.waves[0]) ? foundingConfig.waves[0].pro_price : null,
            },
            {
                name: "Business",
                key: "business",
                monthlyPrice: pricingConfig.business.monthly_price,
                annualPrice: pricingConfig.business.annual_price || Math.round(pricingConfig.business.monthly_price * 12 * (1 - discountPercent / 100)),
                credits: pricingConfig.business.optimizations,
                popular: false,
                features: [
                    { text: `${pricingConfig.business.optimizations} optimizations/month`, included: true },
                    { text: "Full Adaptive AI", included: true },
                    { text: getHistoryText(pricingConfig.business.history_days), included: true },
                    { text: "Bulk export", included: true },
                    { text: "MCP Server Access", included: pricingConfig.business.api_access },
                    { text: "Full API Access", included: pricingConfig.business.api_access },
                    { text: "Priority processing", included: true },
                    { text: "Dedicated support", included: true },
                ],
                cta: "Get Started",
                foundingPrice: (foundingConfig?.enabled && foundingConfig?.waves[0]) ? foundingConfig.waves[0].business_price : null,
            }
        ];
        return tiers;
    }, [pricingConfig, foundingConfig, generalSettings, discountPercent]);

    const handleCheckout = async (planKey: string) => {
        setLoadingPlan(planKey);
        try {
            if (planKey === 'free') {
                router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
                return;
            }

            let discountCode: string | undefined;
            const selectedTier = TIERS.find(t => t.key === planKey);

            if (selectedTier?.foundingPrice && foundingConfig?.enabled) {
                if (planKey === 'pro') discountCode = 'FOUNDING_PRO';
                if (planKey === 'business') discountCode = 'FOUNDING_BUSINESS';
            }

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: planKey,
                    billing: isAnnual ? 'annual' : 'monthly',
                    discountCode,
                }),
            });
            const data = await res.json();

            if (data.success && data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else if (res.status === 401) {
                router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
            } else {
                router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
            }
        } catch (error) {
            router.push(`/signup?plan=${planKey}&billing=${isAnnual ? "annual" : "monthly"}`);
        } finally {
            setLoadingPlan(null);
        }
    };

    if (!settings) {
        return (
            <section id="pricing" className="py-32 relative scroll-mt-20 overflow-hidden">
                <Container>
                    <div className="text-center animate-pulse">
                        <div className="h-12 w-64 bg-white/10 mx-auto rounded mb-4" />
                        <div className="h-4 w-48 bg-white/5 mx-auto rounded" />
                    </div>
                </Container>
            </section>
        );
    }

    const foundingMemberActive = foundingConfig?.enabled;

    return (
        <section id="pricing" className="py-32 relative scroll-mt-20 overflow-hidden">
            <Container>
                {/* Founding Member Banner */}
                {foundingMemberActive && (
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
                                {TIERS.find(t => t.key === 'pro')?.foundingPrice && (
                                    <div>Pro: <span className="text-white font-bold">${TIERS.find(t => t.key === 'pro')?.foundingPrice}/mo</span> <span className="line-through decoration-sunset-orange">Regular ${TIERS.find(t => t.key === 'pro')?.monthlyPrice}</span></div>
                                )}
                                {TIERS.find(t => t.key === 'business')?.foundingPrice && (
                                    <div>Business: <span className="text-white font-bold">${TIERS.find(t => t.key === 'business')?.foundingPrice}/mo</span> <span className="line-through decoration-sunset-orange">Regular ${TIERS.find(t => t.key === 'business')?.monthlyPrice}</span></div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                            Annual <Badge className="ml-2 px-1.5 py-0.5 text-[8px] bg-electric-cyan text-midnight font-bold border-none">SAVE {discountPercent}%</Badge>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto gap-6 mb-8 items-start">
                    {TIERS.map((tier) => {
                        const displayPrice = tier.foundingPrice !== null ? tier.foundingPrice : tier.monthlyPrice;
                        // Calculate annual price
                        // For free tier (key='free'), price is 0
                        const annualPrice = tier.key === 'free' ? 0 : Math.round(displayPrice * 12 * 0.8); // 20% off
                        const monthlyFromAnnual = (annualPrice / 12).toFixed(0);

                        const isFree = tier.key === 'free';

                        return (
                            <div key={tier.key} className={cn("h-full", tier.popular && "-mt-4 mb-4 lg:mb-0")}>
                                <Card className={cn(
                                    "relative flex flex-col h-full glass transition-all duration-500 bg-midnight/60 overflow-visible",
                                    isFree ? "border-electric-cyan/5 bg-midnight/40" : "border-electric-cyan/10",
                                    tier.popular && "border-electric-cyan/40 bg-midnight/80 shadow-[0_0_60px_rgba(0,255,255,0.15)] z-10"
                                )}>
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="px-4 py-1 bg-electric-cyan text-midnight font-bold tracking-widest text-[10px] uppercase border-none hover:bg-electric-cyan">MOST POPULAR</Badge>
                                        </div>
                                    )}

                                    <CardHeader className="pt-10 pb-6 px-6 text-center md:text-left">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className={cn("text-xl font-display uppercase tracking-widest", isFree ? "text-white/80" : "text-white")}>
                                                {tier.name}
                                            </CardTitle>
                                            {tier.foundingPrice && (
                                                <Badge className="bg-sunset-orange/20 text-sunset-orange border border-sunset-orange/40 text-[9px] uppercase tracking-wider">Founding</Badge>
                                            )}
                                        </div>

                                        <div className="mt-6">
                                            <div className="flex items-baseline">
                                                <span className={cn("text-xl font-display", isFree ? "text-white/60" : "text-electric-cyan")}>$</span>
                                                <span className={cn("text-6xl font-display ml-1", isFree ? "text-white/80" : "text-white")}>
                                                    {isFree ? "0" : (isAnnual ? monthlyFromAnnual : displayPrice)}
                                                </span>
                                                <span className="ml-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                                                    {isFree ? "/forever" : "/mo"}
                                                </span>
                                            </div>

                                            {tier.foundingPrice && (
                                                <div className="mt-1 text-xs text-sunset-orange line-through decoration-sunset-orange/50 font-medium">
                                                    Regular: ${tier.monthlyPrice}/mo
                                                </div>
                                            )}

                                            {isAnnual && !isFree && (
                                                <div className="mt-1 text-xs text-white/30 font-mono">
                                                    Billed ${annualPrice} yearly
                                                </div>
                                            )}

                                            {isFree && (
                                                <div className="mt-1 text-xs text-white/30 font-mono">
                                                    Try Eloquo risk-free
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 px-6 pb-6">
                                        <div className="h-px w-full bg-gradient-to-r from-electric-cyan/30 to-transparent mb-6" />
                                        <ul className="space-y-4">
                                            {tier.features.map((feature, i) => (
                                                <li key={i} className="flex items-start text-sm group/item">
                                                    <div className={cn(
                                                        "mr-3 mt-1 h-3 w-3 rounded-sm flex items-center justify-center transition-colors",
                                                        feature.included
                                                            ? (isFree ? "border border-electric-cyan/20" : "border border-electric-cyan/40 group-hover/item:border-electric-cyan")
                                                            : "opacity-30"
                                                    )}>
                                                        {feature.included ? (
                                                            <Check className={cn("h-2 w-2 transition-opacity", isFree ? "text-electric-cyan/60" : "text-electric-cyan opacity-0 group-hover/item:opacity-100")} />
                                                        ) : (
                                                            <X className="h-2 w-2 text-white/30" />
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "font-medium transition-colors",
                                                        feature.included
                                                            ? (isFree ? "text-white/50" : "text-white/60 group-hover/item:text-white")
                                                            : "text-white/20 line-through"
                                                    )}>{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter className="px-6 pb-10 flex-col">
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
                                        {isFree && (
                                            <p className="mt-3 text-[10px] text-white/30 text-center">
                                                Card required for verification
                                            </p>
                                        )}
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
