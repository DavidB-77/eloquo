import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useFreeTierStatus } from '@/hooks/useFingerprint';
import { cn } from '@/lib/utils';

interface FreeTierIndicatorProps {
    className?: string;
    compact?: boolean;
}

export function FreeTierIndicator({ className, compact = false }: FreeTierIndicatorProps) {
    const { user } = useAuth();
    const {
        canOptimize,
        isPaidUser,
        remaining,
        weeklyLimit,
        flagged,
        isLoading,
        updateStatus
    } = useFreeTierStatus(user?.id ?? null);

    // Listen for usage updates from other components (e.g., optimize page)
    // Update state DIRECTLY from event detail for immediate UI update
    useEffect(() => {
        const handleUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('[FreeTierIndicator] Received event with detail:', customEvent.detail);

            // Direct state update from event - no API call needed!
            updateStatus({
                canOptimize: customEvent.detail.canOptimize,
                remaining: customEvent.detail.remaining,
                weeklyUsage: customEvent.detail.weeklyUsage,
                weeklyLimit: customEvent.detail.weeklyLimit,
                flagged: customEvent.detail.flagged,
                isPaidUser: false
            });

            console.log('[FreeTierIndicator] State updated to remaining:', customEvent.detail.remaining);
        };

        window.addEventListener('free-tier-updated', handleUpdate);
        return () => window.removeEventListener('free-tier-updated', handleUpdate);
    }, [updateStatus]);

    if (isLoading || isPaidUser) return null;

    // Abuse Flag State
    if (flagged) {
        return (
            <div className={cn("rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400", className)}>
                <p className="font-semibold">Account Flagged</p>
                <p className="mt-1 opacity-90">
                    Suspicious activity detected. Please <Link href="/pricing" className="underline hover:text-red-300">upgrade to Pro</Link> to continue.
                </p>
            </div>
        );
    }

    const progress = Math.min(100, (remaining / weeklyLimit) * 100);
    const isDepleted = remaining === 0;
    const isWarning = remaining === 1;

    // Color Logic
    const barColor = isDepleted
        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
        : isWarning
            ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
            : 'bg-gradient-to-r from-[#09B7B4] to-[#0DD4CF] shadow-[0_0_10px_rgba(9,183,180,0.4)]';

    const textColor = isDepleted ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-[#09B7B4]';

    if (compact) {
        return (
            <div className={cn("flex flex-col gap-1.5", className)}>
                <div className="flex items-center justify-between text-xs">
                    <span className={cn("font-medium", textColor)}>
                        {remaining} left
                    </span>
                    <Link href="/pricing" className="text-[10px] text-zinc-500 hover:text-white transition-colors">
                        Increasing limits?
                    </Link>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-500", barColor)}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    // Full Version
    return (
        <div className={cn("rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-sm", className)}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-300">Free Tier Usage</span>
                <span className={cn("text-sm font-bold", textColor)}>
                    {remaining} of {weeklyLimit} remaining
                </span>
            </div>

            <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div
                    className={cn("absolute top-0 left-0 h-full transition-all duration-700 ease-out rounded-full", barColor)}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {isDepleted ? (
                <div className="text-xs text-center">
                    <p className="text-zinc-400 mb-2">Weekly limit reached.</p>
                    <Link
                        href="/pricing"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-[#09B7B4] px-3 py-2 text-sm font-medium text-black transition-all hover:bg-[#09B7B4]/90 hover:shadow-[0_0_15px_rgba(9,183,180,0.3)]"
                    >
                        Upgrade for Unlimited
                    </Link>
                </div>
            ) : (
                <p className="text-xs text-zinc-500 text-center">
                    Resets on Monday. <Link href="/pricing" className="text-zinc-400 hover:text-[#09B7B4] transition-colors">Upgrade to remove limits</Link>
                </p>
            )}
        </div>
    );
}

export function FreeTierBadge({ className }: { className?: string }) {
    const { user } = useAuth();
    const { isPaidUser, remaining, weeklyLimit, isLoading } = useFreeTierStatus(user?.id ?? null);

    if (isLoading || isPaidUser) return null;

    const isDepleted = remaining === 0;
    const isWarning = remaining === 1;

    const badgeStyles = isDepleted
        ? 'bg-red-500/10 text-red-500 border-red-500/20'
        : isWarning
            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            : 'bg-[#09B7B4]/10 text-[#09B7B4] border-[#09B7B4]/20';

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium backdrop-blur-md",
            badgeStyles,
            className
        )}>
            {remaining}/{weeklyLimit} free
        </div>
    );
}
