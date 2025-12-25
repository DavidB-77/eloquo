import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { callAnalyze } from "@/lib/n8n";

/**
 * POST /api/mcp/analyze
 * API key authenticated analysis (FREE - no credits used)
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

        // 2. Call n8n analyze (no usage tracking - it's free)
        const body = await request.json();
        const result = await callAnalyze(body.prompt);

        return NextResponse.json(result);

    } catch (error) {
        console.error("MCP analyze error:", error);
        return NextResponse.json(
            { success: false, error: { message: "Internal server error" } },
            { status: 500 }
        );
    }
}
