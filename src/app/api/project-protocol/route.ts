import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth-server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const AGENT_URL = process.env.AGENT_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
    try {
        // Parse body first to get user info as fallback
        const body = await request.json();
        const { projectIdea, projectType, techPreferences, targetAudience, additionalContext, userId, userEmail, userTier: clientTier } = body;

        if (!projectIdea || projectIdea.length < 20) {
            return NextResponse.json({ error: "Project idea must be at least 20 characters" }, { status: 400 });
        }

        // Try to get authenticated user, but fall back to client-provided data if auth fails
        let userTier = clientTier || 'free';
        let actualUserId = userId || 'anonymous';

        try {
            const token = await getToken();
            if (token) {
                convex.setAuth(token);
                const usageData = await convex.query(api.profiles.getUsage, {});
                if (usageData) {
                    userTier = usageData.tier || 'free';
                }
            }
        } catch (tokenError) {
            console.error('[PROJECT PROTOCOL] Auth fallback - using client-provided tier:', clientTier);
            // Continue with client-provided tier if auth fails on VPS
        }

        // Block free tier users
        if (userTier === 'free') {
            return NextResponse.json({
                error: "Project Protocol requires a paid subscription. Please upgrade to access.",
                requiresUpgrade: true
            }, { status: 403 });
        }

        // Ensure user tier is valid for agent (it only accepts basic/pro/business)
        const agentTier = userTier === 'enterprise' ? 'business' :
            (userTier === 'free' ? 'basic' : userTier);

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
                user_id: actualUserId,
                user_email: userEmail || null,
                user_tier: agentTier,
            }),
        });

        if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            console.error('[PROJECT PROTOCOL] Agent error:', agentResponse.status, errorText);
            throw new Error(`Agent failed: ${agentResponse.status}`);
        }

        const result = await agentResponse.json();
        console.log('[PROJECT PROTOCOL] Agent response received');

        // Save to Convex optimization history
        try {
            await convex.mutation(api.optimizations.createOptimizationForAgent, {
                userId: actualUserId,
                userEmail: userEmail || undefined,
                originalPrompt: projectIdea,
                optimizedPrompt: result.project_summary || projectIdea.slice(0, 200),
                targetModel: "gemini-2.5-flash",
                optimizationType: "comprehensive" as const,
                strength: "default",
                context: JSON.stringify({ projectType, techPreferences, targetAudience }),
                improvements: ["PRD Generated", "Architecture Created", "Stories Created"],
                metrics: {
                    qualityScore: 8.5,
                    total_tokens: result.total_tokens || 0,
                    processing_time_sec: (result.processing_time_ms || 0) / 1000,
                    api_cost_usd: 0,
                },
                outputMode: "project-protocol",
                creditsUsed: 5,
                projectName: result.project_name || "Untitled Project",
                projectSummary: result.project_summary || "",
                prdDocument: result.documents?.prd || result.prd || "",
                architectureDocument: result.documents?.architecture || result.architecture || "",
                storiesDocument: result.documents?.stories || result.stories || "",
            });
            console.log('[PROJECT PROTOCOL] Saved to history');
        } catch (saveError) {
            console.error('[PROJECT PROTOCOL] Failed to save to history:', saveError);
            // Don't fail the request, just log - user still gets their result
        }

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
