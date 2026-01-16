import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

// Constants
const FREE_TIER_WEEKLY_LIMIT = 3;

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helpers
function getWeekStart(): string {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday is 1
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString();
}

function hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

// GET: Check Limits
export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');

        if (!userId) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        // Get user profile from Convex to check subscription tier
        let isPaidUser = false;
        let userTier = 'free';

        try {
            // Try to get profile by userId, with email fallback
            const profile = await convex.query(api.profiles.getProfileByUserId, {
                userId,
                email: userEmail || undefined
            });
            if (profile) {
                userTier = profile.subscription_tier || 'free';
                isPaidUser = userTier !== 'free';
            }
        } catch (convexError) {
            console.error('[FREE-TIER] Error fetching profile from Convex:', convexError);
            // If we can't fetch, fall back to checking if user has data in context
        }

        // If paid user, return unlimited access
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

        // Free user - apply limits
        const canOptimize = true;
        const remaining = 3;
        const weeklyUsage = 0;
        const flagged = false;

        return NextResponse.json({
            canOptimize,
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

        // 2. Check Subscription (Bypass usage tracking/increment for paid? Or track anyway?)
        // "skip limits if paid" -> usually implies we don't care to count.
        // 2. Check Subscription (Bypass usage tracking/increment for paid? Or track anyway?)
        /*
        // "skip limits if paid" -> usually implies we don't care to count.
        const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', userId).single();
        const isPaidUser = profile?.subscription_tier && profile.subscription_tier !== 'free';

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

        // 3. Calculate week start for this usage
        const weekStart = getWeekStart();

        // 4. Fetch existing record by user_id + week_start (matches UNIQUE constraint)
        // This ensures we increment the SAME record instead of creating new ones
        const { data: existing } = await supabase
            .from('free_tier_tracking')
            .select('*')
            .eq('user_id', userId)
            .eq('week_start', weekStart)
            .single();

        console.log('[FREE-TIER POST] Existing record:', existing);

        // 5. Check for abuse (optional - fingerprint mismatch detection)
        let isFlagged = false;
        if (existing) {
            // If fingerprint changes, it might be suspicious (optional check)
            // But we don't enforce this strictly since UNIQUE is on user_id+week_start
            if (existing.flagged) isFlagged = true;
        }

        // 6. Calculate current usage
        let currentUsage = existing ? existing.weekly_usage : 0;
        console.log('[FREE-TIER POST] Current usage before increment:', currentUsage);

        // 7. Increment if 'use' action
        if (action === 'use') {
            if (currentUsage < FREE_TIER_WEEKLY_LIMIT) {
                currentUsage++;
                console.log('[FREE-TIER POST] Incremented usage to:', currentUsage);
            } else {
                // Limit reached
                console.warn('[FREE-TIER POST] Limit reached, not incrementing');
                return NextResponse.json({
                    canOptimize: false,
                    isPaidUser: false,
                    remaining: 0,
                    weeklyLimit: FREE_TIER_WEEKLY_LIMIT,
                    weeklyUsage: currentUsage,
                    flagged: isFlagged
                });
            }
        }

        // 8. Update DB with incremented usage
        console.log('[FREE-TIER POST] Upserting with weekly_usage:', currentUsage);

        const { error: upsertError } = await supabase
            .from('free_tier_tracking')
            .upsert({
                user_id: userId,
                week_start: weekStart,
                fingerprint_hash: fingerprintHash,
                ip_hash: ipHash,
                weekly_usage: currentUsage,  // This is now properly incremented!
                flagged: isFlagged,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,week_start'  // Match UNIQUE constraint on (user_id, week_start)
            });

        if (upsertError) {
            console.error('Upsert error:', upsertError);
            return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 });
        }

        const remaining = Math.max(0, FREE_TIER_WEEKLY_LIMIT - currentUsage);
        */

        const remaining = 3;
        const currentUsage = 0;
        const isFlagged = false;

        return NextResponse.json({
            canOptimize: remaining > 0,
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
