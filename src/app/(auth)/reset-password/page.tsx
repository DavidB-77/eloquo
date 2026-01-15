"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";

export default function ResetPasswordPage() {
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    // const supabase = createClient();
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        // Mocked - Supabase removed
        setError("Password reset is currently undergoing maintenance. Please contact support.");
        setIsLoading(false);

        /*
        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push("/login?message=Password updated successfully");
        }
        */
    };

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
            <Container className="max-w-md">
                <Card className="shadow-xl border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-display font-bold">Reset your password</CardTitle>
                        <CardDescription>
                            Choose a new secure password for your account.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleReset}>
                        <CardContent className="grid gap-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            <FormField label="New Password">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </FormField>
                            <FormField label="Confirm New Password">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </FormField>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" isLoading={isLoading}>
                                Update Password
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </Container>
        </div>
    );
}
