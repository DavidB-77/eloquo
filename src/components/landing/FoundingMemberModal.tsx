"use client";

import * as React from "react";
import { X, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { FoundingMemberConfig } from "@/lib/settings";

interface FoundingMemberModalProps {
    config: FoundingMemberConfig;
}

export function FoundingMemberModal({ config }: FoundingMemberModalProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [hasHydrated, setHasHydrated] = React.useState(false);

    React.useEffect(() => {
        setHasHydrated(true);

        const hasDismissed = localStorage.getItem("eloquo_founding_dismissed");
        if (hasDismissed) return;

        // Trigger after 3 seconds
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 3000);

        // Also trigger on scroll to pricing if not yet shown (handled by simple listener for now)
        const handleScroll = () => {
            const pricingSection = document.getElementById("pricing");
            if (pricingSection) {
                const rect = pricingSection.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setIsOpen(true);
                    window.removeEventListener("scroll", handleScroll);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem("eloquo_founding_dismissed", new Date().toISOString());
    };

    const handleClaim = () => {
        const pricingSection = document.getElementById("pricing");
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: "smooth" });
        }
        setIsOpen(false);
    };

    if (!hasHydrated || !isOpen || !config.enabled) return null;

    // Calculate current wave data
    let currentWaveIndex = 0;
    let accumSpots = 0;

    for (let i = 0; i < config.waves.length; i++) {
        if (config.current_count < accumSpots + config.waves[i].spots) {
            currentWaveIndex = i;
            break;
        }
        accumSpots += config.waves[i].spots;
    }

    // Recalculate accumulation for display logic
    let displayAccum = 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-midnight border border-electric-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(9,183,180,0.2)] scale-in-95 animate-in duration-300 scrollbar-hide">

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="p-8">
                    <div className="mb-6 flex items-center space-x-2">
                        <Badge className="bg-neon-orange text-midnight font-bold tracking-widest uppercase px-3 py-1">Founding Member</Badge>
                        <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Limited Availability</span>
                    </div>

                    <h2 className="text-3xl font-display text-white mb-2">
                        Lock In <span className="text-electric-cyan italic">Lifetime</span> Pricing
                    </h2>
                    <p className="text-white/60 mb-8 font-medium">
                        Be one of the first 500 members to join Eloquo and secure exclusive discounted rates forever.
                    </p>

                    <div className="space-y-3 mb-8">
                        {config.waves.map((wave, idx) => {
                            const isCurrent = idx === currentWaveIndex;
                            const isPast = idx < currentWaveIndex;
                            const isFuture = idx > currentWaveIndex;

                            // Calculate spots remaining for this specific wave if it's current
                            const spotsInThisWave = wave.spots;
                            const spotsUsedPreviously = displayAccum;
                            const spotsUsedTotal = config.current_count;
                            const spotsUsedInThisWave = Math.max(0, spotsUsedTotal - spotsUsedPreviously);
                            const remaining = Math.max(0, spotsInThisWave - spotsUsedInThisWave);

                            // Update accum for next iteration
                            displayAccum += wave.spots;

                            return (
                                <div
                                    key={wave.wave}
                                    className={cn(
                                        "relative border rounded-xl p-4 transition-all",
                                        isCurrent ? "bg-deep-teal/20 border-electric-cyan/40 shadow-[0_0_15px_rgba(9,183,180,0.1)]" : "bg-white/5 border-white/5 opacity-60 grayscale"
                                    )}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-2.5 right-4 bg-neon-orange text-midnight text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                                            Current Wave 🔥
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className={cn("text-xs font-bold uppercase tracking-wider mb-1", isCurrent ? "text-white" : "text-white/40")}>
                                                Wave {wave.wave} <span className="text-white/30 font-medium normal-case ml-1">(Next {wave.spots})</span>
                                            </div>
                                            {isCurrent && (
                                                <div className="text-[10px] font-mono text-neon-orange font-bold">
                                                    {remaining} spots remaining
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div>
                                            <span className="text-[10px] uppercase text-white/40 block">Pro</span>
                                            <span className={cn("font-bold", isCurrent ? "text-electric-cyan" : "text-white/60")}>${wave.pro_price}/mo</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase text-white/40 block">Business</span>
                                            <span className={cn("font-bold", isCurrent ? "text-electric-cyan" : "text-white/60")}>${wave.business_price}/mo</span>
                                        </div>
                                    </div>

                                    {isPast && (
                                        <div className="absolute inset-0 bg-midnight/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full bg-midnight">Sold Out</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Final Regular Pricing Block */}
                        <div className="bg-transparent border border-white/5 rounded-xl p-4 opacity-40 grayscale">
                            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-white/40">
                                After 500 Founders
                            </div>
                            <div className="flex items-center space-x-6">
                                <div>
                                    <span className="text-[10px] uppercase text-white/40 block">Pro</span>
                                    <span className="font-bold text-white/60">$15/mo</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-white/40 block">Business</span>
                                    <span className="font-bold text-white/60">$35/mo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <Button
                            onClick={handleClaim}
                            className="w-full btn-gradient text-white font-bold uppercase tracking-widest h-12 rounded-xl glow-sm hover:glow-md text-sm"
                        >
                            Claim My Spot <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <button
                            onClick={handleDismiss}
                            className="text-xs text-white/40 hover:text-white transition-colors underline decoration-white/20"
                        >
                            I'll pay full price later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
