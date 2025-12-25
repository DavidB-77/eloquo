"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const supabase = createClient();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            setIsSuccess(true);
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
                <Container className="max-w-md text-center">
                    <Card className="shadow-xl border-none p-8">
                        <h2 className="text-2xl font-bold font-display mb-4">Check your email</h2>
                        <p className="text-muted-foreground mb-8">
                            We&apos;ve sent a password reset link to <span className="font-bold text-foreground">{email}</span>. Click the link to choose a new password.
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
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
                <Card className="shadow-xl border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-display font-bold">Forgot password?</CardTitle>
                        <CardDescription>
                            Enter your email and we&apos;ll send you a link to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleResetRequest}>
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
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" isLoading={isLoading}>
                                Send Reset Link
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </Container>
        </div>
    );
}
