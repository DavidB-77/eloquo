import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth-server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const AGENT_URL = process.env.AGENT_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        let token: string | undefined;
        try {
            token = await getToken();
        } catch (tokenError) {
            console.error('[PROJECT PROTOCOL] Token error:', tokenError);
            return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 });
        }

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Set token and get user
        convex.setAuth(token);
        const session = await convex.query(api.auth.getUserById, {});
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile for tier info
        const usageData = await convex.query(api.profiles.getUsage, {});
        if (!usageData) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const userTier = usageData.tier || 'free';

        // Block free tier users
        if (userTier === 'free') {
            return NextResponse.json({
                error: "Project Protocol requires a paid subscription. Please upgrade to access.",
                requiresUpgrade: true
            }, { status: 403 });
        }

        const body = await request.json();
        const { projectIdea, projectType, techPreferences, targetAudience, additionalContext, userId, userTier: clientTier } = body;

        if (!projectIdea || projectIdea.length < 20) {
            return NextResponse.json({ error: "Project idea must be at least 20 characters" }, { status: 400 });
        }

        // Call local Agent V3
        console.log('[PROJECT PROTOCOL] Calling agent at:', `${AGENT_URL}/project-protocol`);

        const agentResponse = await fetch(`${AGENT_URL}/project-protocol`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                project_idea: projectIdea,
                project_type: projectType || "saas",
                tech_preferences: techPreferences || null,
                target_audience: targetAudience || null,
                additional_context: additionalContext || null,
                user_id: userId || session.id,
                user_tier: userTier === 'enterprise' ? 'business' : userTier,
            }),
        });

        if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            console.error('[PROJECT PROTOCOL] Agent error:', agentResponse.status, errorText);
            throw new Error(`Agent failed: ${agentResponse.status}`);
        }

        const result = await agentResponse.json();
        console.log('[PROJECT PROTOCOL] Agent response received');

        return NextResponse.json({
            success: true,
            projectName: result.project_name || result.projectName || "Untitled Project",
            projectSummary: result.project_summary || result.projectSummary || projectIdea.slice(0, 100),
            documents: {
                prd: result.prd || result.documents?.prd || "",
                architecture: result.architecture || result.documents?.architecture || "",
                stories: result.stories || result.documents?.stories || "",
            },
            metrics: {
                totalTokens: result.total_tokens || result.metrics?.totalTokens || 0,
                processingTimeMs: result.processing_time_ms || result.metrics?.processingTimeMs || 0,
                processingTimeSec: Math.round((result.processing_time_ms || result.metrics?.processingTimeMs || 0) / 1000),
            },
            usage: {
                creditsUsed: 5,
            },
        });

    } catch (error) {
        console.error("[PROJECT PROTOCOL] Error:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Generation failed"
        }, { status: 500 });
    }
}
