"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { signUp } from "@/lib/auth-client";

export default function AdminSignupPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password || !name) {
            setError("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signUp.email({
                email,
                password,
                name,
            });

            if (result.error) {
                setError(result.error.message || "Signup failed");
                setIsLoading(false);
                return;
            }

            // Success - redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err?.message || "Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-midnight flex flex-col justify-center py-12">
            <Container className="max-w-md">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-white/60 hover:text-electric-cyan mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <Card className="shadow-xl border border-white/10 bg-white/5">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-display font-bold text-white">
                            Admin Signup
                        </CardTitle>
                        <CardDescription className="text-white/60">
                            Create your admin account (no payment required)
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSignup}>
                        <CardContent className="grid gap-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <FormField label="Name" className="text-white">
                                <Input
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/20 text-white"
                                />
                            </FormField>

                            <FormField label="Email" className="text-white">
                                <Input
                                    type="email"
                                    placeholder="dj.blaney77@gmail.com"
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
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Admin Account"
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                                <Shield className="h-3 w-3" />
                                Secure authentication via Better Auth
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
