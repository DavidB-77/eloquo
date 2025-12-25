import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { callOrchestrate } from "@/lib/n8n";
import { checkOrchestrationLimits, incrementUsage, saveToHistory } from "@/lib/usage";

/**
 * POST /api/mcp/orchestrate
 * API key authenticated orchestration for MCP clients
 */
export async function POST(request: Request) {
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

        if (!keyData.hasMcpAccess) {
            return NextResponse.json(
                { success: false, error: { message: "MCP requires Pro or higher subscription" } },
                { status: 403 }
            );
        }

        // 2. Call n8n first to get segment count
        const body = await request.json();
        const result = await callOrchestrate({
            prompt: body.prompt,
            targetModel: body.targetModel || "universal",
            strength: body.strength || "medium",
            context: body.context,
            orchestration: {
                enabled: true,
                maxSegments: body.orchestration?.maxSegments || 6,
            },
        });

        // 3. Check if we have enough premium credits
        if (result.success && result.data) {
            const segmentsCount = result.data.totalSegments;
            const premiumCreditsNeeded = result.data.premiumCreditsUsed || Math.max(0, segmentsCount - 1);

            const { canOrchestrate, usage } = await checkOrchestrationLimits(keyData.userId, segmentsCount);

            if (!canOrchestrate) {
                return NextResponse.json(
                    {
                        success: false,
                        error: { message: "Not enough premium credits for orchestration" },
                        usage,
                        creditsNeeded: premiumCreditsNeeded
                    },
                    { status: 429 }
                );
            }

            // 4. Track usage
            await incrementUsage(keyData.userId, 1, premiumCreditsNeeded);

            // 5. Save to history
            await saveToHistory(
                keyData.userId,
                body.prompt,
                result.data.summary,
                body.targetModel || "universal",
                body.strength || "medium",
                true,
                result.data.segments,
                null,
                { segmentsCount, premiumCreditsUsed: premiumCreditsNeeded }
            );
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("MCP orchestrate error:", error);
        return NextResponse.json(
            { success: false, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
