"use client";

import { cn } from "@/lib/utils";

interface UsageBarProps {
    used: number;
    limit: number;
    label?: string;
    showNumbers?: boolean;
    className?: string;
}

export function UsageBar({
    used,
    limit,
    label = "Usage",
    showNumbers = true,
    className
}: UsageBarProps) {
    const percentage = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className={cn("space-y-1", className)}>
            {(label || showNumbers) && (
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                    {label && <span className="text-dusty-rose font-semibold">{label}</span>}
                    {showNumbers && (
                        <span className={cn(
                            "font-bold",
                            isAtLimit ? "text-terracotta" : isNearLimit ? "text-sunset-orange" : "text-electric-cyan"
                        )}>
                            {limit === Infinity ? `${used} used` : `${used}/${limit}`}
                        </span>
                    )}
                </div>
            )}
            <div className="relative h-1.5 w-full bg-deep-teal rounded-full overflow-hidden shadow-inner">
                <div
                    className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                        isAtLimit ? "bg-terracotta" : isNearLimit ? "bg-sunset-orange" : "bg-electric-cyan shadow-[0_0_10px_rgba(9,183,180,0.5)]"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
