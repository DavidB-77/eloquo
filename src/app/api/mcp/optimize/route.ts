import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { callOptimize } from "@/lib/n8n";
import { checkUsageLimits, incrementUsage, saveToHistory } from "@/lib/usage";

/**
 * POST /api/mcp/optimize
 * API key authenticated optimization for MCP clients
 */
export async function POST(request: Request) {
    try {
        // 1. Validate API key format
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

        // 2. Check subscription tier for MCP access
        if (!keyData.hasMcpAccess) {
            return NextResponse.json(
                { success: false, error: { message: "MCP requires Pro or higher subscription" } },
                { status: 403 }
            );
        }

        // 3. Check usage limits
        const { canOptimize, usage } = await checkUsageLimits(keyData.userId);
        if (!canOptimize) {
            return NextResponse.json(
                { success: false, error: { message: "Monthly optimization limit reached" }, usage },
                { status: 429 }
            );
        }

        // 4. Call n8n
        const body = await request.json();
        const result = await callOptimize({
            prompt: body.prompt,
            targetModel: body.targetModel || "universal",
            strength: body.strength || "medium",
            additionalContext: body.context,
            userId: keyData.userId,
            userTier: keyData.tier,
        });

        // 5. Track usage and save to history
        if ('success' in result && result.success && 'results' in result) {
            await incrementUsage(keyData.userId, 1, 0);
            await saveToHistory(
                keyData.userId,
                body.prompt,
                result.results.full,
                body.targetModel || "universal",
                body.strength || "medium",
                false,
                null,
                result.improvements,
                result.metrics
            );
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("MCP optimize error:", error);
        return NextResponse.json(
            { success: false, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
