"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeOption {
    action: "upgrade" | "standard";
    label: string;
    url?: string;
}

interface UpgradeModalProps {
    isOpen: boolean;
    message: string;
    comprehensiveRemaining: number;
    options: UpgradeOption[];
    onUpgrade: () => void;
    onContinueStandard: () => void;
    onClose: () => void;
}

export function UpgradeModal({
    isOpen,
    message,
    comprehensiveRemaining,
    options,
    onUpgrade,
    onContinueStandard,
    onClose,
}: UpgradeModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        const upgradeOption = options.find((o) => o.action === "upgrade");
        if (upgradeOption?.url) {
            router.push(upgradeOption.url);
        }
        onUpgrade();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md bg-background border rounded-xl shadow-xl p-6 mx-4 animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                    <Sparkles className="h-7 w-7 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-center mb-2">
                    Upgrade for More Power
                </h2>

                {/* Message */}
                <p className="text-sm text-muted-foreground text-center mb-6">
                    {message}
                </p>

                {/* Credits remaining indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 py-3 bg-muted/50 rounded-lg">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Comprehensive credits remaining: <strong className="text-foreground">{comprehensiveRemaining}</strong></span>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {options.map((option) => (
                        <Button
                            key={option.action}
                            variant={option.action === "upgrade" ? "default" : "outline"}
                            className={cn(
                                "w-full justify-between h-12",
                                option.action === "upgrade" && "bg-gradient-to-r from-primary to-primary/80"
                            )}
                            onClick={option.action === "upgrade" ? handleUpgrade : onContinueStandard}
                        >
                            <span>{option.label}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export type { UpgradeOption };
