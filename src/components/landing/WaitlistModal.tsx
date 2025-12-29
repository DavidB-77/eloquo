"use client";

import * as React from "react";
import { X, Rocket, Gift, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
    const [email, setEmail] = React.useState("");
    const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = React.useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            setErrorMessage("Please enter a valid email address");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "landing" }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
            } else {
                setErrorMessage(data.error || "Something went wrong");
                setStatus("error");
            }
        } catch (error) {
            setErrorMessage("Failed to submit. Please try again.");
            setStatus("error");
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
            setEmail("");
            setStatus("idle");
            setErrorMessage("");
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 glass border border-electric-cyan/20 rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {status === "success" ? (
                    /* Success State */
                    <div className="text-center py-6">
                        <div className="h-16 w-16 rounded-full bg-electric-cyan/20 flex items-center justify-center mx-auto mb-6">
                            <Check className="h-8 w-8 text-electric-cyan" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                        <p className="text-white/60 mb-6">
                            We'll email you when it's your turn to access Eloquo.
                        </p>
                        <Button onClick={handleClose} className="btn-gradient">
                            Got it
                        </Button>
                    </div>
                ) : (
                    /* Form State */
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="h-14 w-14 rounded-full bg-electric-cyan/20 flex items-center justify-center mx-auto mb-4">
                                <Rocket className="h-7 w-7 text-electric-cyan" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Eloquo is in Private Beta
                            </h3>
                            <p className="text-white/60 text-sm">
                                We're putting the finishing touches on something special.
                                <br />
                                Join the waitlist for early access and founding member pricing.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-midnight/50 border-electric-cyan/20 text-white placeholder:text-white/30"
                                disabled={status === "loading"}
                            />

                            {status === "error" && (
                                <p className="text-red-400 text-sm">{errorMessage}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 btn-gradient font-bold uppercase tracking-wider"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    "Join Waitlist"
                                )}
                            </Button>
                        </form>

                        {/* Founding Member Perk */}
                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sunset-orange/10 border border-sunset-orange/20">
                                <Gift className="h-4 w-4 text-sunset-orange" />
                                <span className="text-xs font-bold text-sunset-orange">
                                    First 100 members get 40% off forever
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
