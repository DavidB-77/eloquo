"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/layout/Container";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupSuccessPage() {
    const router = useRouter();
    const supabase = createClient();
    const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = React.useState<string>('Setting up your account...');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const completeSignup = async () => {
            try {
                // Get stored signup intent from sessionStorage
                const signupIntent = sessionStorage.getItem('eloquo_signup_intent');

                if (!signupIntent) {
                    // Check if already logged in
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        setStatus('success');
                        setMessage('Welcome back! Redirecting...');
                        setTimeout(() => router.push('/dashboard'), 1500);
                        return;
                    }

                    setStatus('error');
                    setError('Signup session expired. Please try signing up again.');
                    return;
                }

                const { email, password, timestamp } = JSON.parse(signupIntent);

                // Check if signup intent is too old (1 hour)
                if (Date.now() - timestamp > 3600000) {
                    sessionStorage.removeItem('eloquo_signup_intent');
                    setStatus('error');
                    setError('Signup session expired. Please try again.');
                    return;
                }

                setMessage('Verifying payment...');

                // Check if payment was recorded (poll a few times)
                let pendingSignup = null;
                for (let i = 0; i < 15; i++) {
                    const res = await fetch(`/api/auth/check-pending-signup?email=${encodeURIComponent(email)}`);
                    const data = await res.json();

                    if (data.success && data.pending) {
                        pendingSignup = data.pending;
                        break;
                    }

                    // Wait 1 second before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setMessage(`Verifying payment... (${i + 1}/15)`);
                }

                if (!pendingSignup) {
                    setStatus('error');
                    setError('Payment verification pending. Please wait a moment and refresh, or contact support.');
                    return;
                }

                setMessage('Creating your account...');

                // Create the account with the user's password
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            subscription_tier: pendingSignup.subscription_tier,
                        },
                    },
                });

                if (signUpError) {
                    // User might already exist - try to sign in
                    if (signUpError.message.includes('already registered')) {
                        const { error: signInError } = await supabase.auth.signInWithPassword({
                            email,
                            password,
                        });

                        if (signInError) {
                            setStatus('error');
                            setError('Account exists but password is different. Please use the login page.');
                            return;
                        }
                    } else {
                        throw signUpError;
                    }
                }

                // Mark pending signup as complete and update profile
                await fetch('/api/auth/complete-signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                // Clear sessionStorage
                sessionStorage.removeItem('eloquo_signup_intent');

                setStatus('success');
                setMessage('Account created! Redirecting to dashboard...');

                // Auto sign in if we just signed up
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    await supabase.auth.signInWithPassword({ email, password });
                }

                setTimeout(() => router.push('/dashboard'), 1500);

            } catch (err) {
                console.error('Signup completion error:', err);
                setStatus('error');
                setError('Something went wrong. Please contact support.');
            }
        };

        completeSignup();
    }, [router, supabase]);

    return (
        <div className="min-h-screen bg-midnight flex flex-col items-center justify-center py-12">
            <Container className="max-w-md text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-electric-cyan mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
                        <p className="text-white/60">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Welcome to Eloquo!</h1>
                        <p className="text-white/60">{message}</p>
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
