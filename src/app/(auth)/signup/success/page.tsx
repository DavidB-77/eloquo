"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/layout/Container";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupSuccessPage() {
    const router = useRouter();
    const supabase = createClient();
    const [status, setStatus] = React.useState<'loading' | 'success' | 'password_reset' | 'error'>('loading');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const completeSignup = async () => {
            try {
                // Get stored signup intent
                const signupIntent = sessionStorage.getItem('eloquo_signup_intent');

                if (!signupIntent) {
                    // No signup intent - maybe they already logged in
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        router.push('/dashboard');
                        return;
                    }

                    setStatus('error');
                    setError('Signup session expired. Please try again.');
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

                // Wait a moment for webhook to create the account
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Try to sign in with the credentials
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) {
                    // Account might not be created yet with this password
                    // Send password reset email so they can set their password
                    console.log('Sign in failed, sending password reset:', signInError);

                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/reset-password`,
                    });

                    if (!resetError) {
                        setStatus('password_reset');
                        sessionStorage.removeItem('eloquo_signup_intent');
                        return;
                    }

                    // If password reset also failed, show generic success
                    // The webhook should have created their account
                    setStatus('success');
                    sessionStorage.removeItem('eloquo_signup_intent');
                    return;
                }

                // Success! Clear storage and redirect
                sessionStorage.removeItem('eloquo_signup_intent');
                setStatus('success');

                // Short delay then redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);

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
                        <h1 className="text-2xl font-bold text-white">Setting up your account...</h1>
                        <p className="text-white/60">Please wait while we complete your registration.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Welcome to Eloquo!</h1>
                        <p className="text-white/60">Your account has been created. Redirecting to dashboard...</p>
                    </div>
                )}

                {status === 'password_reset' && (
                    <div className="space-y-4">
                        <Mail className="h-12 w-12 text-electric-cyan mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Almost there!</h1>
                        <p className="text-white/60">
                            Your payment was successful. We've sent you an email to set your password.
                            Check your inbox to complete your account setup.
                        </p>
                        <Button onClick={() => router.push('/login')} className="mt-6">
                            Go to Login
                        </Button>
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
