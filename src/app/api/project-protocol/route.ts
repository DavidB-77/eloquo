import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { projectIdea, projectType, techPreferences, targetAudience, additionalContext } = body;

        if (!projectIdea || projectIdea.length < 20) {
            return NextResponse.json({ error: "Project idea must be at least 20 characters" }, { status: 400 });
        }

        // Get user profile for tier and credits
        const { data: profile } = await supabase
            .from("profiles")
            .select("tier, optimizations_remaining, subscription_tier")
            .eq("id", user.id)
            .single();
        // Block free tier users from Project Protocol
        const userTier = profile?.subscription_tier || profile?.tier || 'free';
        if (userTier === 'free') {
            console.log('[PROJECT PROTOCOL API] Free tier user blocked');
            return NextResponse.json({
                error: "Project Protocol requires a Pro subscription. Please upgrade to access.",
                requiresUpgrade: true
            }, { status: 403 });
        }

        if (!profile || profile.optimizations_remaining < 5) {
            return NextResponse.json({
                error: "Insufficient credits. Project Protocol requires 5 credits.",
                creditsRequired: 5,
                creditsRemaining: profile?.optimizations_remaining || 0
            }, { status: 402 });
        }

        // Call n8n webhook
        const n8nUrl = process.env.N8N_PROJECT_PROTOCOL_WEBHOOK || "https://n8n.eloquo.io/webhook/project-protocol";

        const n8nResponse = await fetch(n8nUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectIdea,
                projectType: projectType || "saas",
                techPreferences: techPreferences || "",
                targetAudience: targetAudience || "",
                additionalContext: additionalContext || "",
                userId: user.id,
                userEmail: user.email,
                userTier: profile.tier,
            }),
        });

        if (!n8nResponse.ok) {
            throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
        }

        const result = await n8nResponse.json();

        // Deduct 5 credits
        await supabase
            .from("profiles")
            .update({
                optimizations_remaining: profile.optimizations_remaining - 5,
                optimizations_used: (profile as any).optimizations_used + 5
            })
            .eq("id", user.id);

        // Log the generation
        await supabase.from("optimization_logs").insert({
            user_id: user.id,
            feature: "project-protocol",
            input_tokens: 0,
            output_tokens: result.metrics?.totalTokens || 0,
            model_used: "multi-model",
            cost_usd: 0,
            processing_time_ms: result.metrics?.processingTimeMs || 0,
        });

        return NextResponse.json({
            success: true,
            projectName: result.projectName || result.analysis?.projectName || "Untitled Project",
            projectSummary: result.projectSummary || result.analysis?.projectSummary || projectIdea.slice(0, 100),
            documents: {
                prd: result.documents?.prd || "",
                architecture: result.documents?.architecture || "",
                stories: result.documents?.stories || "",
            },
            metrics: {
                totalTokens: result.metrics?.totalTokens || 0,
                processingTimeMs: result.metrics?.processingTimeMs || 0,
                processingTimeSec: Math.round((result.metrics?.processingTimeMs || 0) / 1000),
            },
            usage: {
                creditsUsed: 5,
            },
        });

    } catch (error) {
        console.error("Project Protocol error:", error);
        return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
}
