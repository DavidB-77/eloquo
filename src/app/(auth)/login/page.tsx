"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/forms/FormField";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Use Better Auth signIn
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Invalid email or password");
                setIsLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12">
            <Container className="max-w-md">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <Card className="shadow-xl border-none">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-display font-bold">Welcome back</CardTitle>
                        <CardDescription>
                            Enter your email to sign in to your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
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
                            <FormField label="Password">
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="flex justify-end mt-1">
                                    <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </FormField>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button className="w-full" type="submit" isLoading={isLoading}>
                                Sign In
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => signIn.social({ provider: "google", callbackURL: "/dashboard" })}
                                >
                                    Google
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => signIn.social({ provider: "github", callbackURL: "/dashboard" })}
                                >
                                    GitHub
                                </Button>
                            </div>

                            <div className="text-sm text-center text-muted-foreground pt-2">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-primary font-medium hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </Container>
        </div>
    );
}
