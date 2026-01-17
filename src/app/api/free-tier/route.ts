import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

// Constants
const FREE_TIER_WEEKLY_LIMIT = 3;

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helpers
// Helpers
function getWeekStartTimestamp(): number {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday is 1
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    monday.setUTCHours(0, 0, 0, 0);
    return monday.getTime();
}

function hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

// GET: Check Limits
export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id') || 'anonymous';
        const userEmail = request.headers.get('x-user-email');
        // Optional fingerprint for anonymous/fallback tracking
        const fingerprint = request.headers.get('x-fingerprint');

        if (!userId) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        // Get user profile from Convex
        let isPaidUser = false;
        let userTier = 'free';

        try {
            const profile = await convex.query(api.profiles.getProfileByUserId, {
                userId,
                email: userEmail || undefined
            });

            if (profile) {
                userTier = profile.subscription_tier || 'free';
                isPaidUser = userTier !== 'free';
            }
        } catch (convexError) {
            console.error('[FREE-TIER] Error fetching profile:', convexError);
        }

        // 1. Paid User Logic
        if (isPaidUser) {
            return NextResponse.json({
                canOptimize: true,
                isPaidUser: true,
                remaining: 9999,
                weeklyLimit: -1,
                weeklyUsage: 0,
                flagged: false,
                tier: userTier
            });
        }

        // 2. Free User Logic - Check Usage
        const weekStart = getWeekStartTimestamp();
        let weeklyUsage = 0;
        let flagged = false;

        try {
            // Check usage via Convex
            // @ts-ignore
            const usageRecord = await convex.query(api.free_tier.checkUsage, {
                userId,
                weekStart,
                fingerprintHash: fingerprint ? hashString(fingerprint) : undefined
            });

            if (usageRecord) {
                weeklyUsage = usageRecord.weekly_usage;
                flagged = usageRecord.is_flagged;
            }
        } catch (err) {
            console.error('[FREE-TIER] Error checking usage:', err);
        }

        const remaining = Math.max(0, FREE_TIER_WEEKLY_LIMIT - weeklyUsage);

        return NextResponse.json({
            canOptimize: remaining > 0,
            isPaidUser: false,
            remaining,
            weeklyLimit: FREE_TIER_WEEKLY_LIMIT,
            weeklyUsage,
            flagged,
            tier: 'free'
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Track Usage
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, fingerprint, action } = body;

        // Extract IP
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : (request.headers.get('x-real-ip') || 'unknown');

        if (!userId || !fingerprint || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Hash Identifiers
        const fingerprintHash = hashString(fingerprint);
        const ipHash = hashString(ip);

        // 2. Check Subscription (optimization: client should assume free if calling this, but double check?)
        // Ideally we handled "skip if paid" in FE, but backend should verify.
        // We can reuse the profile check logic or just blindly increment for "free" tier users.
        // Let's check profile first to avoid incorrectly limiting paid users if FE calls this by mistake.
        let isPaidUser = false;
        try {
            const profile = await convex.query(api.profiles.getProfileByUserId, { userId });
            if (profile && profile.subscription_tier !== 'free') {
                isPaidUser = true;
            }
        } catch (_e) {
            // Ignore (assume free)
        }

        if (isPaidUser) {
            return NextResponse.json({
                canOptimize: true,
                isPaidUser: true,
                remaining: 9999,
                weeklyLimit: -1,
                weeklyUsage: 0,
                flagged: false
            });
        }

        // 3. Increment Usage in Convex
        const weekStart = getWeekStartTimestamp();
        let currentUsage = 0;
        let remaining = 3;
        const isFlagged = false;

        if (action === 'use') {
            try {
                // @ts-ignore
                const result = await convex.mutation(api.free_tier.incrementUsage, {
                    userId,
                    weekStart,
                    fingerprintHash,
                    ipHash,
                    limit: FREE_TIER_WEEKLY_LIMIT
                });

                currentUsage = result.usage;
                remaining = result.allowed ? FREE_TIER_WEEKLY_LIMIT - currentUsage : 0;

                if (!result.allowed) {
                    return NextResponse.json({
                        canOptimize: false,
                        isPaidUser: false,
                        remaining: 0,
                        weeklyLimit: FREE_TIER_WEEKLY_LIMIT,
                        weeklyUsage: currentUsage,
                        flagged: false
                    });
                }
            } catch (err) {
                console.error('[FREE-TIER] Increment failed:', err);
                return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
            }
        }

        return NextResponse.json({
            canOptimize: true,
            isPaidUser: false,
            remaining,
            weeklyLimit: FREE_TIER_WEEKLY_LIMIT,
            weeklyUsage: currentUsage,
            flagged: isFlagged
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
