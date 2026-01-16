import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Shared secret for internal agent communication
const AGENT_SECRET = process.env.AGENT_SECRET || "eloquo-agent-internal-key";

export async function POST(request: NextRequest) {
    try {
        // Verify this is from our agent (basic security)
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${AGENT_SECRET}`) {
            console.log('[AGENT CREDITS] Invalid or missing authorization');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { user_id, email, action, amount } = body;

        if (!user_id) {
            return NextResponse.json({ error: "user_id required" }, { status: 400 });
        }

        console.log('[AGENT CREDITS] Request:', { user_id, email, action, amount });

        if (action === "check") {
            // Check credits
            const credits = await convex.query(api.profiles.getCreditsForAgent, {
                userId: user_id,
                email: email || undefined,
            });

            if (!credits) {
                console.log('[AGENT CREDITS] User not found for:', user_id, email);
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            console.log('[AGENT CREDITS] Found user, credits:', credits.comprehensive_credits_remaining);
            return NextResponse.json({
                success: true,
                comprehensive_credits_remaining: credits.comprehensive_credits_remaining,
                optimizations_remaining: credits.optimizations_remaining,
                subscription_tier: credits.subscription_tier,
                userId: credits.userId,  // Return actual userId for deduct call
            });

        } else if (action === "deduct") {
            // Deduct credits
            if (!amount || amount <= 0) {
                return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
            }

            const result = await convex.mutation(api.profiles.deductCreditsForAgent, {
                userId: user_id,
                email: email || undefined,
                amount: amount,
            });

            if (!result.success) {
                return NextResponse.json({
                    error: result.error,
                    credits_remaining: result.credits_remaining,
                }, { status: result.error === "User not found" ? 404 : 402 });
            }

            return NextResponse.json({
                success: true,
                credits_remaining: result.credits_remaining,
            });

        } else {
            return NextResponse.json({
                error: "Invalid action. Use 'check' or 'deduct'"
            }, { status: 400 });
        }

    } catch (error) {
        console.error("[AGENT CREDITS] Error:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Internal error"
        }, { status: 500 });
    }
}
