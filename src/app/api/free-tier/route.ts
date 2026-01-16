import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Constants
const FREE_TIER_WEEKLY_LIMIT = 3;
const POLAR_FREE_PRODUCT_ID = '2a415251-2cfd-4d0a-85e6-e59276422e95';

// Initialize Supabase Admin Client
// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

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
        if (!userId) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        // 1. Check Subscription Tier
        // 1. Check Subscription Tier
        /*
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            // Fallback to strict free limits if error? Or assume free.
        }

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

        // 2. Query Usage
        const weekStart = getWeekStart();

        // Find tracking records for this user (could be multiple fingerprints)
        const { data: usages, error: usageError } = await supabase
            .from('free_tier_tracking')
            .select('weekly_usage, week_start, flagged')
            .eq('user_id', userId);

        let weeklyUsage = 0;
        let flagged = false;

        // NO RECORD = FRESH USER = 3 OPTIMIZATIONS AVAILABLE
        // Only count usage if records exist
        if (usages && usages.length > 0) {
            for (const u of usages) {
                // Only count usage from current week
                // Compare as Date objects to handle format differences
                const recordWeekStart = new Date(u.week_start).getTime();
                const currentWeekStart = new Date(weekStart).getTime();
                console.log('[FREE-TIER GET] Comparing week_start:', u.week_start, 'vs', weekStart);
                console.log('[FREE-TIER GET] As timestamps:', recordWeekStart, 'vs', currentWeekStart);
                if (recordWeekStart === currentWeekStart) {
                    weeklyUsage += u.weekly_usage;
                }
                if (u.flagged) flagged = true;
            }
        }

        const remaining = Math.max(0, FREE_TIER_WEEKLY_LIMIT - weeklyUsage);
        const canOptimize = remaining > 0 && !flagged; 
        */

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
            flagged
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
