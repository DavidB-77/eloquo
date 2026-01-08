import { useState, useEffect, useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// --- useFingerprint Hook ---
interface UseFingerprintResult {
    fingerprint: string | null;
    isLoading: boolean;
    error: string | null;
}

export function useFingerprint(): UseFingerprintResult {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFingerprint = async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                setFingerprint(result.visitorId);
            } catch (err) {
                console.error('Failed to load fingerprint:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        loadFingerprint();
    }, []);

    return { fingerprint, isLoading, error };
}

// --- useFreeTierStatus Hook ---
interface FreeTierStatus {
    canOptimize: boolean;
    isPaidUser: boolean;
    remaining: number | undefined;  // undefined means data not loaded yet
    weeklyLimit: number;
    weeklyUsage: number;
    flagged: boolean;
}

interface UseFreeTierStatusResult extends FreeTierStatus {
    isLoading: boolean;
    error: string | null;
    fingerprint: string | null;
    fingerprintLoading: boolean;
    checkStatus: () => Promise<void>;
    updateStatus: (newStatus: Partial<FreeTierStatus>) => void; // Direct state update
    recordUsage: () => Promise<boolean>; // Returns true if usage recorded/allowed
}

export function useFreeTierStatus(userId: string | null): UseFreeTierStatusResult {
    const { fingerprint, isLoading: fingerprintLoading, error: fingerprintError } = useFingerprint();

    // Default to optimistic values so we don't block prematurely with stale data
    // The API will return canOptimize: true with 3 remaining if no tracking record exists
    const [status, setStatus] = useState<FreeTierStatus>({
        canOptimize: true,  // Default to true so we don't block before data loads
        isPaidUser: false,
        remaining: undefined,  // undefined means "not loaded yet" - prevents false triggers
        weeklyLimit: 0,
        weeklyUsage: 0,
        flagged: false,
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(async () => {
        // If we don't have user or fingerprint (and not paid check bypass?), wait?
        // Actually, paid check depends on userId. Fingerprint required for free.
        // We'll proceed if we have at least one or the other.
        if (fingerprintLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (userId) headers['x-user-id'] = userId;
            if (fingerprint) headers['x-fingerprint'] = fingerprint; // Not used in GET per spec but good context

            const res = await fetch('/api/free-tier', { method: 'GET', headers });

            if (!res.ok) {
                throw new Error('Failed to fetch status');
            }

            const data = await res.json();
            setStatus({
                canOptimize: data.canOptimize,
                isPaidUser: data.isPaidUser,
                remaining: data.remaining,
                weeklyLimit: data.weeklyLimit,
                weeklyUsage: data.weeklyUsage,
                flagged: data.flagged
            });

        } catch (err) {
            console.error('Free Tier Status Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to check status');
        } finally {
            setIsLoading(false);
        }
    }, [userId, fingerprint, fingerprintLoading]);

    // Fetch fresh data when hook mounts with userId
    useEffect(() => {
        if (userId && !fingerprintLoading) {
            console.log('[useFreeTierStatus] Hook mounted with userId - fetching fresh status');
            checkStatus();
        }
    }, [userId, fingerprintLoading]); // Fetch when userId or fingerprint loading changes

    // Listen for global 'free-tier-updated' events to keep ALL hook instances in sync
    useEffect(() => {
        const handleUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('[useFreeTierStatus] Received global free-tier-updated event:', customEvent.detail);
            setStatus(prev => ({
                ...prev,
                canOptimize: customEvent.detail.canOptimize,
                remaining: customEvent.detail.remaining,
                weeklyUsage: customEvent.detail.weeklyUsage,
                weeklyLimit: customEvent.detail.weeklyLimit,
                flagged: customEvent.detail.flagged,
                isPaidUser: false
            }));
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('free-tier-updated', handleUpdate);
            return () => window.removeEventListener('free-tier-updated', handleUpdate);
        }
    }, []); // Only set up listener once

    const recordUsage = async (): Promise<boolean> => {
        console.log('[recordUsage] Called');
        console.log('[recordUsage] fingerprintLoading:', fingerprintLoading);
        console.log('[recordUsage] fingerprint:', fingerprint);
        console.log('[recordUsage] userId:', userId);

        if (fingerprintLoading) return false;
        if (!fingerprint && !userId) {
            setError('Cannot record usage: Missing identity');
            console.error('[recordUsage] Missing identity - fingerprint and userId both null');
            return false;
        }

        setIsLoading(true);
        try {
            console.log('[recordUsage] Sending POST to /api/free-tier with action: use');

            const res = await fetch('/api/free-tier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    fingerprint: fingerprint || 'unknown-fingerprint',
                    action: 'use'
                })
            });

            console.log('[recordUsage] Response status:', res.status, res.ok);

            if (!res.ok) throw new Error('Failed to record usage');

            const data = await res.json();
            console.log('[recordUsage] Response data:', data);

            // Update local state with fresh data from server
            setStatus({
                canOptimize: data.canOptimize,
                isPaidUser: data.isPaidUser,
                remaining: data.remaining,
                weeklyLimit: data.weeklyLimit,
                weeklyUsage: data.weeklyUsage,
                flagged: data.flagged
            });

            console.log('[recordUsage] Updated local state - canOptimize:', data.canOptimize, 'remaining:', data.remaining);

            // Broadcast event to sync all FreeTierIndicator components
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('free-tier-updated', {
                    detail: {
                        canOptimize: data.canOptimize,
                        remaining: data.remaining,
                        weeklyUsage: data.weeklyUsage,
                        weeklyLimit: data.weeklyLimit,
                        flagged: data.flagged
                    }
                }));
                console.log('[recordUsage] Dispatched free-tier-updated event');
            }

            // Return TRUE if this usage was successfully recorded (status 200)
            // data.canOptimize indicates if they can optimize NEXT time, not if THIS one succeeded
            // If we got here with status 200, this optimization IS allowed
            console.log('[recordUsage] Usage recorded successfully - this optimization is ALLOWED');
            console.log('[recordUsage] canOptimize for NEXT time:', data.canOptimize, 'remaining:', data.remaining);
            return true; // THIS optimization was allowed

        } catch (err) {
            console.error('[recordUsage] Error:', err);
            setError(err instanceof Error ? err.message : 'Usage record failed');
            return false; // THIS optimization failed
        } finally {
            setIsLoading(false);
        }
    };

    // Direct state update for external sync (e.g., from custom events)
    const updateStatus = useCallback((newStatus: Partial<FreeTierStatus>) => {
        console.log('[updateStatus] Updating with:', newStatus);
        setStatus(prev => ({
            ...prev,
            ...newStatus
        }));
    }, []);

    return {
        ...status,
        isLoading,
        error: error || fingerprintError,
        fingerprint,
        fingerprintLoading,
        checkStatus,
        updateStatus,
        recordUsage
    };
}
