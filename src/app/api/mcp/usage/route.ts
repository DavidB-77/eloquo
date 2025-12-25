import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { getUserUsage, TIER_LIMITS } from "@/lib/usage";

/**
 * GET /api/mcp/usage
 * API key authenticated usage stats for MCP clients
 */
export async function GET(request: Request) {
    try {
        // 1. Validate API key
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer elk_")) {
            return NextResponse.json(
                { success: false, error: { message: "Invalid API key format" } },
                { status: 401 }
            );
        }

        const apiKey = authHeader.replace("Bearer ", "");
        const keyData = await validateApiKey(apiKey);

        if (!keyData) {
            return NextResponse.json(
                { success: false, error: { message: "Invalid or revoked API key" } },
                { status: 401 }
            );
        }

        // 2. Get usage stats
        const usage = await getUserUsage(keyData.userId);
        const limits = TIER_LIMITS[usage.tier];

        // 3. Calculate days remaining in billing cycle
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return NextResponse.json({
            success: true,
            data: {
                tier: usage.tier,
                status: "active",
                optimizations: {
                    used: usage.optimizationsUsed,
                    limit: usage.optimizationsLimit,
                    remaining: Math.max(0, usage.optimizationsLimit - usage.optimizationsUsed),
                },
                premiumCredits: {
                    used: usage.premiumCreditsUsed,
                    limit: usage.premiumCreditsLimit,
                    remaining: Math.max(0, usage.premiumCreditsLimit - usage.premiumCreditsUsed),
                },
                billingCycle: {
                    daysRemaining,
                },
            },
        });

    } catch (error) {
        console.error("MCP usage error:", error);
        return NextResponse.json(
            { success: false, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
