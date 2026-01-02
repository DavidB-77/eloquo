"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { ArrowLeft, Loader2, Check, Shield, AlertTriangle } from "lucide-react";
import { getGeneralSettings } from "@/lib/settings";

const PLANS = {
    basic: {
        name: "Basic",
        price: "$7",
        foundingPrice: "$7",
        features: ["150 optimizations/month", "Full Adaptive AI", "6-month history", "Email support"],
    },
    pro: {
        name: "Pro",
        price: "$15",
        foundingPrice: "$9",
        popular: true,
        features: ["400 optimizations/month", "Full Adaptive AI", "1-year history", "MCP Server Access", "Full API Access", "Priority support"],
    },
    business: {
        name: "Business",
        price: "$35",
        foundingPrice: "$20",
        features: ["1000 optimizations/month", "Full Adaptive AI", "Unlimited history", "MCP Server Access", "Full API Access", "Dedicated support"],
    },
};

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    // Settings State
    const [registrationAllowed, setRegistrationAllowed] = React.useState(true);
    const [checkingSettings, setCheckingSettings] = React.useState(true);

    // Get plan from URL or default to pro
    const planKey = (searchParams.get('plan') || 'pro') as keyof typeof PLANS;
    const billing = searchParams.get('billing') || 'monthly';
    const plan = PLANS[planKey] || PLANS.pro;

    React.useEffect(() => {
        getGeneralSettings().then(settings => {
            setRegistrationAllowed(settings.allow_new_signups);
            setCheckingSettings(false);
        });
    }, []);

    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            // Store signup intent in sessionStorage (we'll use this after payment)
            sessionStorage.setItem('eloquo_signup_intent', JSON.stringify({
                email,
                password,
                plan: planKey,
                billing,
                timestamp: Date.now()
            }));

            // Create checkout session (no auth required)
            const res = await fetch('/api/checkout/guest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    plan: planKey,
                    billing,
                }),
            });

            const data = await res.json();

            if (data.success && data.checkoutUrl) {
                // Redirect to Lemon Squeezy checkout
                window.location.href = data.checkoutUrl;
            } else {
                setError(data.error || "Failed to create checkout session");
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handleChangePlan = () => {
        router.push('/#pricing');
    };

    if (checkingSettings) {
        return (
            <div className="min-h-screen bg-midnight flex flex-col justify-center py-12">
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-electric-cyan" />
                </div>
            </div>
        );
    }

    if (!registrationAllowed) {
        return (
            <div className="min-h-screen bg-midnight flex flex-col justify-center py-12">
                <Container className="max-w-md text-center">
                    <Card className="shadow-xl border border-white/10 bg-white/5 p-8">
                        <div className="h-16 w-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold font-display mb-4 text-white">Registration Closed</h2>
                        <p className="text-white/60 mb-8">
                            We are currently not accepting new signups. Please check back later or contact support.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-midnight flex flex-col justify-center py-12">
            <Container className="max-w-lg">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-white/60 hover:text-electric-cyan mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <Card className="shadow-xl border border-white/10 bg-white/5">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-display font-bold text-white">
                            Create Your Account
                        </CardTitle>
                        <CardDescription className="text-white/60">
                            Enter your details and continue to payment
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleContinueToPayment}>
                        <CardContent className="grid gap-6">
                            {/* Selected Plan Display */}
                            <div className={`p-4 rounded-xl border ${(plan as any).popular ? 'border-electric-cyan bg-electric-cyan/10' : 'border-white/20 bg-white/5'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{plan.name} Plan</h3>
                                            {(plan as any).popular && (
                                                <span className="text-[10px] px-2 py-0.5 bg-electric-cyan text-midnight rounded-full font-bold">
                                                    POPULAR
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-2xl font-bold text-white">{plan.foundingPrice}</span>
                                            <span className="text-white/40">/mo</span>
                                            {plan.foundingPrice !== plan.price && (
                                                <span className="text-sm text-white/40 line-through">{plan.price}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleChangePlan}
                                        className="text-xs text-electric-cyan hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                                <ul className="mt-3 space-y-1">
                                    {plan.features.slice(0, 3).map((feature, i) => (
                                        <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                                            <Check className="h-3 w-3 text-electric-cyan" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form Fields */}
                            <FormField label="Email" className="text-white">
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/20 text-white"
                                />
                            </FormField>

                            <FormField label="Password" description="Must be at least 6 characters" className="text-white">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-white/5 border-white/20 text-white"
                                />
                            </FormField>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button
                                className="w-full h-12 btn-gradient text-white font-bold"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating checkout...
                                    </>
                                ) : (
                                    <>
                                        Continue to Payment
                                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                                <Shield className="h-3 w-3" />
                                Secure payment via Lemon Squeezy
                            </div>

                            <div className="text-sm text-center text-white/60">
                                Already have an account?{" "}
                                <Link href="/login" className="text-electric-cyan font-medium hover:underline">
                                    Log in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </Container>
        </div>
    );
}
