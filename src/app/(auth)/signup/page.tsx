"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { getGeneralSettings } from "@/lib/settings";

export default function SignupPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    // Settings State
    const [registrationAllowed, setRegistrationAllowed] = React.useState(true);
    const [checkingSettings, setCheckingSettings] = React.useState(true);

    const supabase = createClient();

    React.useEffect(() => {
        getGeneralSettings().then(settings => {
            setRegistrationAllowed(settings.allow_new_signups);
            setCheckingSettings(false);
        });

        // Save selected plan to localStorage for after email confirmation
        const params = new URLSearchParams(window.location.search);
        const plan = params.get('plan');
        const billing = params.get('billing');
        if (plan && billing) {
            localStorage.setItem('eloquo_pending_plan', JSON.stringify({ plan, billing }));
        }
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            setIsSuccess(true);
            setIsLoading(false);
        }
    };

    if (checkingSettings) {
        return (
            <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!registrationAllowed) {
        return (
            <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
                <Container className="max-w-md text-center">
                    <Card className="shadow-xl border-none p-8">
                        <div className="h-16 w-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold font-display mb-4">Registration Closed</h2>
                        <p className="text-muted-foreground mb-8">
                            We are currently not accepting new signups. Please check back later or contact support if you believe this is an error.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </Card>
                </Container>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
                <Container className="max-w-md text-center">
                    <Card className="shadow-xl border-none p-8">
                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold font-display mb-4">Check your email</h2>
                        <p className="text-muted-foreground mb-8">
                            We&apos;ve sent a magic link to <span className="font-bold text-foreground">{email}</span>. Click the link to verify your account and get started.
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </Card>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
            <Container className="max-w-md">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <Card className="shadow-xl border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-display font-bold">Create an account</CardTitle>
                        <CardDescription>
                            Enter your email to get started with Eloquo
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="grid gap-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            <FormField label="Email">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </FormField>
                            <FormField label="Password" description="Must be at least 6 characters long">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </FormField>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full" type="submit" isLoading={isLoading}>
                                Join Eloquo
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-medium hover:underline">
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
