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
                <div className="flex items-center justify-between text-xs">
                    {label && <span className="text-muted-foreground">{label}</span>}
                    {showNumbers && (
                        <span className={cn(
                            "font-medium",
                            isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-foreground"
                        )}>
                            {limit === Infinity ? `${used} used` : `${used}/${limit}`}
                        </span>
                    )}
                </div>
            )}
            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                    className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-300",
                        isAtLimit ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
