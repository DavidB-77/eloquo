"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

    return (
        <section id="pricing" className="py-24 scroll-mt-20">
            <Container>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        Choose the plan that fits your workflow. Save 17% with annual billing.
                    </p>

                    <div className="flex items-center justify-center space-x-4">
                        <span className={cn("text-sm transition-colors", !isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative h-6 w-11 rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <div
                                className={cn(
                                    "absolute left-1 top-1 h-4 w-4 rounded-full bg-primary transition-transform",
                                    isAnnual ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                        <span className={cn("text-sm transition-colors", isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
                            Annual <Badge variant="success" className="ml-1 px-1 py-0 text-[10px]">SAVE 17%</Badge>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {PRICING_PLANS.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={cn(
                                "relative flex flex-col h-full",
                                plan.popular && "border-primary shadow-xl scale-105 z-10"
                            )}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <Badge variant="default" className="px-3 py-1">MOST POPULAR</Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-bold tracking-tight">$</span>
                                        <span className="text-5xl font-bold tracking-tight">
                                            {isAnnual ? Math.round(parseInt(plan.price) * 0.83) : plan.price}
                                        </span>
                                        <span className="ml-1 text-sm text-muted-foreground">/mo</span>
                                    </div>
                                    <p className="mt-4 text-muted-foreground text-sm">
                                        {plan.description}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start text-sm">
                                                <Check className="mr-2 h-4 w-4 text-primary shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full h-11 text-base"
                                        variant={plan.variant as any}
                                        onClick={() => handleCheckout(plan.id)}
                                        isLoading={loadingPlan === plan.id}
                                    >
                                        {plan.cta}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                        <CardContent className="py-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                                        <Building2 className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{ENTERPRISE_PLAN.name}</h3>
                                        <p className="text-muted-foreground">{ENTERPRISE_PLAN.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">
                                            ${isAnnual ? Math.round(249 * 0.83) : 249}
                                            <span className="text-base font-normal text-muted-foreground">/mo</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => handleCheckout("enterprise")}
                                        isLoading={loadingPlan === "enterprise"}
                                    >
                                        Contact Sales
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {ENTERPRISE_PLAN.features.map((feature) => (
                                    <div key={feature} className="flex items-center text-sm">
                                        <Check className="mr-2 h-4 w-4 text-primary shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </section>
    );
}
