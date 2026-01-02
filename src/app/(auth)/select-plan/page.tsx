"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const PLANS = [
    {
        key: "basic",
        name: "Basic",
        price: "$7",
        period: "/mo",
        features: [
            "150 optimizations/month",
            "Full Adaptive AI",
            "6-month prompt history",
            "Export your library",
            "Web dashboard",
            "Email support",
        ],
    },
    {
        key: "pro",
        name: "Pro",
        price: "$9",
        founding: true,
        regularPrice: "$15",
        period: "/mo",
        popular: true,
        features: [
            "400 optimizations/month",
            "Full Adaptive AI",
            "1-year prompt history",
            "Export your library",
            "MCP Server Access",
            "Full API Access",
            "Priority support",
        ],
    },
    {
        key: "business",
        name: "Business",
        price: "$20",
        founding: true,
        regularPrice: "$35",
        period: "/mo",
        features: [
            "1000 optimizations/month",
            "Full Adaptive AI",
            "Unlimited prompt history",
            "Bulk export",
            "MCP Server Access",
            "Full API Access",
            "Priority processing",
            "Dedicated support",
        ],
    },
];

export default function SelectPlanPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState<string | null>(null);
    const [isAnnual, setIsAnnual] = React.useState(false);

    // Check for pending plan from signup flow
    React.useEffect(() => {
        const pendingPlan = localStorage.getItem('eloquo_pending_plan');
        if (pendingPlan) {
            try {
                const { plan, billing } = JSON.parse(pendingPlan);
                localStorage.removeItem('eloquo_pending_plan');
                // Auto-trigger checkout for the selected plan
                handleSelectPlan(plan, billing === 'annual');
            } catch (e) {
                console.error('Error parsing pending plan:', e);
            }
        }
    }, []);

    const handleSelectPlan = async (planKey: string, annual: boolean = isAnnual) => {
        setIsLoading(planKey);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: planKey,
                    billing: annual ? 'annual' : 'monthly'
                }),
            });

            const data = await res.json();

            if (data.success && data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                console.error('Checkout failed:', data.error);
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-midnight py-12">
            <Container>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-white/60 text-lg">
                        Select a plan to start optimizing your prompts
                    </p>

                    {/* Monthly/Annual Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={!isAnnual ? "text-white" : "text-white/40"}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className={`w-14 h-7 rounded-full p-1 transition-colors ${isAnnual ? "bg-electric-cyan" : "bg-white/20"
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isAnnual ? "translate-x-7" : ""
                                }`} />
                        </button>
                        <span className={isAnnual ? "text-white" : "text-white/40"}>
                            Annual <span className="text-electric-cyan text-sm">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.key}
                            className={`relative rounded-2xl p-6 ${plan.popular
                                ? "bg-gradient-to-b from-electric-cyan/20 to-midnight border-2 border-electric-cyan"
                                : "bg-white/5 border border-white/10"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-electric-cyan text-midnight text-xs font-bold rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            {plan.founding && (
                                <div className="absolute -top-3 right-4 px-3 py-1 bg-sunset-orange text-white text-xs font-bold rounded-full">
                                    FOUNDING
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-white/40">{plan.period}</span>
                                {plan.regularPrice && (
                                    <span className="text-white/40 line-through text-sm">
                                        {plan.regularPrice}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                                        <Check className="h-4 w-4 text-electric-cyan flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full"
                                variant={plan.popular ? "default" : "outline"}
                                onClick={() => handleSelectPlan(plan.key)}
                                disabled={isLoading === plan.key}
                            >
                                {isLoading === plan.key ? "Loading..." : "Select Plan"}
                            </Button>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
