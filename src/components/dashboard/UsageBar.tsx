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
        <div className={cn("space-y-3", className)}>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                <span>{label}</span>
                {showNumbers && (
                    <span className="text-white">
                        {limit === Infinity ? 'Unlimited' : `${used} / ${limit}`}
                    </span>
                )}
            </div>
            <div className="h-2 w-full bg-midnight/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div
                    className="h-full bg-electric-cyan rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(9,183,180,0.5)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
