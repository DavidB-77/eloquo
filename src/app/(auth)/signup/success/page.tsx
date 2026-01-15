"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient, signUp } from "@/lib/auth-client";
import { Container } from "@/components/layout/Container";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function SignupSuccessPage() {
    const router = useRouter();
    const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = React.useState<string>('Verifying your payment...');
    const [error, setError] = React.useState<string | null>(null);
    const ensureProfile = useMutation(api.profiles.ensureProfile);

    // Get stored signup intent from sessionStorage
    const [signupIntent, setSignupIntent] = React.useState<any>(null);

    React.useEffect(() => {
        const intent = sessionStorage.getItem('eloquo_signup_intent');
        if (intent) {
            try {
                const parsed = JSON.parse(intent);
                // Check if signup intent is too old (1 hour)
                if (Date.now() - parsed.timestamp > 3600000) {
                    sessionStorage.removeItem('eloquo_signup_intent');
                    setStatus('error');
                    setError('Signup session expired. Please try again.');
                } else {
                    setSignupIntent(parsed);
                }
            } catch (e) {
                console.error("Failed to parse signup intent", e);
                setStatus('error');
                setError('Invalid signup session. Please try again.');
            }
        } else {
            // Check if already logged in
            authClient.getSession().then(session => {
                if (session?.data?.user) {
                    setStatus('success');
                    setMessage('Welcome back! Redirecting...');
                    setTimeout(() => router.push('/dashboard'), 1500);
                } else {
                    setStatus('error');
                    setError('Signup session expired. Please try signing up again.');
                }
            });
        }
    }, [router]);

    // Use Convex query to reactively watch for the payment confirmation
    const pendingSignup = useQuery(
        api.pendingSignups.checkPendingSignup,
        signupIntent?.email ? { email: signupIntent.email } : "skip"
    );

    // Effect to handle account creation once payment is detected
    React.useEffect(() => {
        if (!signupIntent || !pendingSignup || status !== 'loading') return;

        const completeSignup = async () => {
            try {
                setMessage('Creating your account...');

                // Create the account with Better Auth
                const { data: authData, error: authError } = await signUp.email({
                    email: signupIntent.email,
                    password: signupIntent.password,
                    name: "",
                    callbackURL: "/dashboard",
                });

                if (authError) {
                    if (authError.message?.toLowerCase().includes('already') || authError.status === 422) {
                        setStatus('error');
                        setError('Account already exists. Please use the login page.');
                        return;
                    } else {
                        throw new Error(authError.message || 'Failed to create account');
                    }
                }

                if (authData?.user) {
                    // Ensure Convex profile exists with the correct tier
                    await ensureProfile({
                        userId: authData.user.id,
                        email: authData.user.email,
                        subscriptionTier: pendingSignup.subscription_tier,
                    });

                    // Complete the signup process in Convex (updates profile and marks pending as done)
                    await convex.mutation(api.pendingSignups.completeSignupProcess, {
                        email: signupIntent.email.toLowerCase(),
                    });

                    // Send confirmation email via Resend
                    const confirmUrl = `${window.location.origin}/api/auth/callback?type=signup&email=${encodeURIComponent(signupIntent.email)}`;
                    await fetch('/api/auth/send-confirmation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: signupIntent.email,
                            confirmUrl,
                        }),
                    });

                    // Clear sessionStorage
                    sessionStorage.removeItem('eloquo_signup_intent');

                    setStatus('success');
                    setMessage('Check your email for a confirmation link to activate your account.');
                }
            } catch (err: any) {
                console.error('Signup completion error:', err);
                setStatus('error');
                setError(err.message || 'Something went wrong. Please contact support.');
            }
        };

        completeSignup();
    }, [signupIntent, pendingSignup, status, ensureProfile]);

    return (
        <div className="min-h-screen bg-midnight flex flex-col items-center justify-center py-12">
            <Container className="max-w-md text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-electric-cyan mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
                        <p className="text-white/60">{message}</p>
                        {signupIntent && !pendingSignup && (
                            <p className="text-xs text-white/40 italic mt-4">
                                Waiting for payment processor confirmation...
                            </p>
                        )}
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Welcome to Eloquo!</h1>
                        <p className="text-white/60">{message}</p>
                        <div className="pt-4">
                            <Button onClick={() => router.push('/login')} className="w-full">
                                Go to Login
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                        <p className="text-white/60">{error}</p>
                        <div className="flex gap-4 justify-center mt-6">
                            <Button variant="outline" onClick={() => router.push('/signup')}>
                                Try Again
                            </Button>
                            <Button onClick={() => router.push('/login')}>
                                Go to Login
                            </Button>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
