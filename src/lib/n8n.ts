/**
 * n8n Webhook Helper
 * Handles all communication with n8n workflow engine
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.eloquo.io';
const N8N_OPTIMIZE_WEBHOOK = process.env.N8N_OPTIMIZE_WEBHOOK || `${N8N_BASE_URL}/webhook/optimize`;
const N8N_ORCHESTRATE_WEBHOOK = process.env.N8N_ORCHESTRATE_WEBHOOK || `${N8N_BASE_URL}/webhook/orchestrate`;
const N8N_ANALYZE_WEBHOOK = process.env.N8N_ANALYZE_WEBHOOK || `${N8N_BASE_URL}/webhook/analyze`;

// Types for n8n requests and responses
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
    // New fields for n8n v2
    userId?: string;
    userTier?: 'basic' | 'pro' | 'business' | 'enterprise';
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

// Response types - all three possible responses from n8n
export interface OptimizeSuccessResponse {
    success: true;
    results: {
        full: string;
        quickRef: string;
        snippet: string;
    };
    improvements: string[];
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

/**
 * Call n8n optimize webhook with full payload
 */
export async function callOptimize(request: OptimizeRequest): Promise<OptimizeResponse> {
    try {
        const response = await fetch(N8N_OPTIMIZE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: request.prompt,
                targetModel: request.targetModel || 'universal',
                strength: request.strength || 'medium',
                additionalContext: request.additionalContext || '',
                userId: request.userId || 'anonymous',
                userTier: request.userTier || 'free',
                contextFiles: request.contextFiles || [],
                contextAnswers: request.contextAnswers || null,
                comprehensiveCreditsRemaining: request.comprehensiveCreditsRemaining ?? 3,
                forceStandard: request.forceStandard || false,
            }),
        });

        if (!response.ok) {
            return { success: false, error: `n8n error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error('n8n optimize error:', error);
        return { success: false, error: 'Failed to connect to optimization service' };
    }
}

/**
 * Call n8n orchestrate webhook
 */
export async function callOrchestrate(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    try {
        const response = await fetch(N8N_ORCHESTRATE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...request,
                orchestration: { enabled: true, maxSegments: request.orchestration?.maxSegments || 6 },
            }),
        });

        if (!response.ok) {
            return { success: false, error: `n8n error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error('n8n orchestrate error:', error);
        return { success: false, error: 'Failed to connect to orchestration service' };
    }
}

/**
 * Call n8n analyze webhook (free, no credits)
 */
export async function callAnalyze(prompt: string): Promise<AnalyzeResponse> {
    try {
        const response = await fetch(N8N_ANALYZE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            return { success: false, error: `n8n error: ${response.status}` };
        }

        return await response.json();
    } catch (error) {
        console.error('n8n analyze error:', error);
        return { success: false, error: 'Failed to connect to analysis service' };
    }
}
