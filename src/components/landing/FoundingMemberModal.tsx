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

        // Trigger after 10 seconds
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 10000);

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
    let spotsInWave = 0;
    let spotsUsedInWave = 0;

    for (let i = 0; i < config.waves.length; i++) {
        const wave = config.waves[i];
        if (config.current_count < accumSpots + wave.spots) {
            currentWaveIndex = i;
            spotsInWave = wave.spots;
            spotsUsedInWave = config.current_count - accumSpots;
            break;
        }
        accumSpots += wave.spots;
    }

    const currentWave = config.waves[currentWaveIndex];
    const spotsRemaining = spotsInWave - spotsUsedInWave;

    if (!currentWave) return null; // Should not happen unless all waves full

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-midnight border border-electric-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(9,183,180,0.2)] overflow-hidden scale-in-95 animate-in duration-300">

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
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

                    <div className="bg-deep-teal/20 border border-electric-cyan/20 rounded-xl p-6 mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Sparkles className="h-24 w-24 text-electric-cyan" />
                        </div>

                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                            <span className="text-xs font-bold text-neon-orange uppercase tracking-widest">Wave {currentWave.wave} Active</span>
                            <span className="text-xs font-mono text-white/60">{spotsRemaining} Spots Left</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-medium">Pro Plan</span>
                                <div className="text-right">
                                    <span className="text-electric-cyan font-bold text-lg">${currentWave.pro_price}/mo</span>
                                    <span className="text-white/40 text-xs line-through ml-2">$15</span>
                                    <span className="text-[10px] text-green-400 font-bold ml-2">SAVE {Math.round((1 - currentWave.pro_price / 15) * 100)}%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white font-medium">Business Plan</span>
                                <div className="text-right">
                                    <span className="text-electric-cyan font-bold text-lg">${currentWave.business_price}/mo</span>
                                    <span className="text-white/40 text-xs line-through ml-2">$35</span>
                                    <span className="text-[10px] text-green-400 font-bold ml-2">SAVE {Math.round((1 - currentWave.business_price / 35) * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            <div className="flex items-center text-xs text-white/60">
                                <Check className="h-3 w-3 text-electric-cyan mr-2" />
                                Price locked forever
                            </div>
                            <div className="flex items-center text-xs text-white/60">
                                <Check className="h-3 w-3 text-electric-cyan mr-2" />
                                Never increases as long as you stay subscribed
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
