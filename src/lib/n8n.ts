/**
 * Agent V3 Adapter (formerly n8n Webhook Helper)
 * Now routes to local Agent V3 (AGNO) instead of n8n
 *
 * IMPORTANT: This file maintains the EXACT same interface as the original n8n.ts
 * so that route.ts and other files don't need any changes.
 */

const AGENT_URL = process.env.AGENT_URL || 'http://localhost:8001';

// Types for requests and responses (unchanged from original)
export interface ContextFile {
    name: string;
    mimeType: string;
    base64: string;
}

export interface OptimizeRequest {
    prompt: string;
    targetModel: 'chatgpt' | 'claude' | 'gemini' | 'cursor' | 'universal';
    strength: 'light' | 'medium' | 'aggressive';
    additionalContext?: string;
    userId?: string;
    userTier?: 'free' | 'basic' | 'pro' | 'business' | 'enterprise';
    contextFiles?: ContextFile[];
    contextAnswers?: Record<string, string> | null;
    comprehensiveCreditsRemaining?: number;
    forceStandard?: boolean;
}

export interface OrchestrationRequest extends OptimizeRequest {
    orchestration?: {
        enabled: boolean;
        maxSegments?: number;
    };
}

// Response types (unchanged from original)
export interface OptimizeSuccessResponse {
    success: true;
    results: {
        full: string;
        quickRef: string;
        snippet: string;
    };
    improvements: string[];
    techniques_applied?: string[];
    metrics: {
        originalTokens: number;
        optimizedTokens: number;
        processingTimeMs: number;
        creditsUsed: number;
        outputMode: 'standard' | 'comprehensive';
        tokensSaved: number;
        qualityScore?: number;
    };
    classification: {
        complexity: 'simple' | 'moderate' | 'complex';
        domain: string;
    };
    validation?: {
        approved: boolean;
        score: number;
    };
    usage: {
        creditsUsed: number;
        comprehensiveRemaining: number;
    };
}

export interface ClarificationQuestion {
    id: string;
    question: string;
    type: 'select' | 'text';
    options?: Array<string | { value: string; label: string }>;
}

export interface NeedsClarificationResponse {
    status: 'needs_clarification';
    message: string;
    questions: ClarificationQuestion[];
    originalPrompt: string;
    classification: {
        domain: string;
        complexity: string;
    };
    creditsWillUse: number;
}

export interface UpgradeRequiredResponse {
    status: 'upgrade_required';
    message: string;
    comprehensiveRemaining: number;
    options: Array<{
        action: 'upgrade' | 'standard';
        label: string;
        url?: string;
    }>;
    originalPrompt: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
}

export type OptimizeResponse =
    | OptimizeSuccessResponse
    | NeedsClarificationResponse
    | UpgradeRequiredResponse
    | ErrorResponse;

export interface OrchestrationSegment {
    order: number;
    name: string;
    targetPlatform: string;
    purpose: string;
    prompt: string;
    instructions: string;
}

export interface OrchestrationResponse {
    success: boolean;
    data?: {
        summary: string;
        totalSegments: number;
        segments: OrchestrationSegment[];
        premiumCreditsUsed: number;
    };
    error?: string;
}

export interface AnalyzeResponse {
    success: boolean;
    data?: {
        complexity: 'simple' | 'moderate' | 'complex';
        domains: string[];
        recommendations: string[];
        suggestedModel: string;
        shouldOrchestrate: boolean;
    };
    error?: string;
}

// ============== V3 Response Types (internal) ==============

interface V3OptimizeResponse {
    status: 'success' | 'needs_clarification' | 'error';
    questions?: Array<{
        id: string;
        question: string;
        type: 'text' | 'select' | 'number';
        options?: any[];
    }> | null;
    message?: string | null;
    optimized_prompt?: string | null;
    full_version?: string | null;
    quick_ref?: string | null;
    snippet?: string | null;
    improvements: string[];
    techniques_applied?: string[];
    quality_score?: number | null;
    processing_time_ms: number;
    stages_used: string[];
    domain?: string | null;
    metrics?: {
        total_tokens: number;
        total_cost: number;
        stages: Record<string, any>;
    } | null;
}

// ============== Helper: Map V3 response to legacy format ==============

function mapV3ToLegacyResponse(
    v3Response: V3OptimizeResponse,
    originalPrompt: string,
    comprehensiveCreditsRemaining: number
): OptimizeResponse {
    // Handle needs_clarification
    if (v3Response.status === 'needs_clarification' && v3Response.questions) {
        return {
            status: 'needs_clarification',
            message: v3Response.message || 'Please provide more details:',
            questions: v3Response.questions.map(q => ({
                id: q.id,
                question: q.question,
                type: q.type === 'number' ? 'text' : q.type as 'text' | 'select',
                options: q.options,
            })),
            originalPrompt: originalPrompt,
            classification: {
                domain: v3Response.domain || 'general',
                complexity: v3Response.stages_used.length > 2 ? 'complex' : 'simple',
            },
            creditsWillUse: 1,
        };
    }

    // Handle error
    if (v3Response.status === 'error') {
        return {
            success: false,
            error: v3Response.message || 'Optimization failed',
        };
    }

    // Handle success
    const originalTokens = Math.ceil(originalPrompt.length / 4);
    const optimizedTokens = Math.ceil((v3Response.optimized_prompt?.length || 0) / 4);

    return {
        success: true,
        results: {
            full: v3Response.optimized_prompt || '',
            quickRef: v3Response.quick_ref || '',
            snippet: v3Response.snippet || '',
        },
        improvements: v3Response.improvements || [],
        techniques_applied: v3Response.techniques_applied || [],
        metrics: {
            originalTokens: originalTokens,
            optimizedTokens: optimizedTokens,
            processingTimeMs: v3Response.processing_time_ms || 0,
            creditsUsed: 1,
            outputMode: 'standard',
            tokensSaved: originalTokens - optimizedTokens,
            qualityScore: v3Response.quality_score || undefined,
        },
        classification: {
            complexity: v3Response.stages_used.length > 2 ? 'complex' :
                v3Response.stages_used.length > 1 ? 'moderate' : 'simple',
            domain: v3Response.domain || 'general',
        },
        validation: {
            approved: true,
            score: v3Response.quality_score || 8,
        },
        usage: {
            creditsUsed: 1,
            comprehensiveRemaining: comprehensiveCreditsRemaining,
        },
    };
}

// ============== Main Functions ==============

/**
 * Call Agent V3 optimize endpoint
 * Maintains same interface as original n8n callOptimize
 */
export async function callOptimize(request: OptimizeRequest): Promise<OptimizeResponse> {
    try {
        // Map legacy tier names to V3 format
        const tierMap: Record<string, 'basic' | 'pro' | 'business'> = {
            'free': 'basic',
            'basic': 'basic',
            'pro': 'pro',
            'business': 'business',
            'enterprise': 'business',
        };
        const v3Tier = tierMap[request.userTier || 'free'] || 'basic';

        // Build V3 request
        const v3Request = {
            prompt: request.prompt,
            user_tier: v3Tier,
            context: request.additionalContext || undefined,
            clarification_answers: request.contextAnswers || undefined,
            files: request.contextFiles || undefined,
            target_model: request.targetModel || 'auto',
        };

        const response = await fetch(`${AGENT_URL}/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(v3Request),
        });

        if (!response.ok) {
            return { success: false, error: `Agent error: ${response.status}` };
        }

        const v3Response: V3OptimizeResponse = await response.json();

        // Map V3 response to legacy format
        return mapV3ToLegacyResponse(
            v3Response,
            request.prompt,
            request.comprehensiveCreditsRemaining ?? 3
        );

    } catch (error) {
        console.error('Agent V3 optimize error:', error);
        return { success: false, error: 'Failed to connect to optimization service' };
    }
}

/**
 * Call Agent V3 for orchestration
 * V3 handles complexity automatically, so this just calls optimize
 */
export async function callOrchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    try {
        // V3 doesn't have separate orchestration - use optimize
        const result = await callOptimize(request);

        if ('success' in result && result.success) {
            // Convert to orchestration format
            return {
                success: true,
                data: {
                    summary: 'Optimization complete',
                    totalSegments: 1,
                    segments: [{
                        order: 1,
                        name: 'Optimized Prompt',
                        targetPlatform: request.targetModel || 'universal',
                        purpose: 'Main optimized version',
                        prompt: result.results.full,
                        instructions: result.improvements.join('\n'),
                    }],
                    premiumCreditsUsed: 1,
                },
            };
        }

        return { success: false, error: 'Orchestration failed' };

    } catch (error) {
        console.error('Agent V3 orchestrate error:', error);
        return { success: false, error: 'Failed to connect to orchestration service' };
    }
}

/**
 * Call Agent V3 for analysis
 * V3 doesn't have separate analyze - uses optimize internally
 */
export async function callAnalyze(prompt: string): Promise<AnalyzeResponse> {
    try {
        const response = await fetch(`${AGENT_URL}/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                user_tier: 'free',
            }),
        });

        if (!response.ok) {
            return { success: false, error: `Agent error: ${response.status}` };
        }

        const v3Response: V3OptimizeResponse = await response.json();

        // Extract analysis from V3 response
        return {
            success: true,
            data: {
                complexity: v3Response.stages_used.length > 2 ? 'complex' :
                    v3Response.stages_used.length > 1 ? 'moderate' : 'simple',
                domains: [v3Response.domain || 'general'],
                recommendations: v3Response.improvements || [],
                suggestedModel: 'claude',
                shouldOrchestrate: v3Response.stages_used.length > 2,
            },
        };

    } catch (error) {
        console.error('Agent V3 analyze error:', error);
        return { success: false, error: 'Failed to connect to analysis service' };
    }
}

// ============== REFINE FUNCTION ==============
export interface RefineRequest {
    originalPrompt: string;
    instruction: string;
    userTier: string;
}

export interface RefineResponse {
    success: boolean;
    refinedPrompt?: string;
    changesMade?: string[];
    error?: string;
}

export async function callRefine(request: RefineRequest): Promise<RefineResponse> {
    try {
        const response = await fetch(`${AGENT_URL}/refine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                original_prompt: request.originalPrompt,
                instruction: request.instruction,
                user_tier: (request.userTier === 'enterprise' ? 'business' : request.userTier) || 'free',
            }),
        });

        if (!response.ok) {
            return { success: false, error: `Refine error: ${response.status}` };
        }

        const data = await response.json();

        if (data.status === 'success') {
            // Parse the refined prompt - it may contain extra text
            let refinedPrompt = data.refined_prompt || '';

            // If the response contains "Refined prompt:" prefix, extract just the prompt
            if (refinedPrompt.includes('Refined prompt:')) {
                refinedPrompt = refinedPrompt.split('Refined prompt:')[1];
                // Stop at "Changes made:" or "Specific changes:"
                if (refinedPrompt.includes('Changes made:')) {
                    refinedPrompt = refinedPrompt.split('Changes made:')[0];
                }
                if (refinedPrompt.includes('Specific changes:')) {
                    refinedPrompt = refinedPrompt.split('Specific changes:')[0];
                }
                refinedPrompt = refinedPrompt.trim();
            }

            return {
                success: true,
                refinedPrompt: refinedPrompt,
                changesMade: data.changes_made || [],
            };
        }

        return { success: false, error: data.error || 'Refinement failed' };
    } catch (error) {
        console.error('Refine error:', error);
        return { success: false, error: 'Failed to connect to refine service' };
    }
}
