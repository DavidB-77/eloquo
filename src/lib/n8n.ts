/**
 * n8n Webhook Helper
 * Handles all communication with n8n workflow engine
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.eloquo.io';
const N8N_OPTIMIZE_WEBHOOK = process.env.N8N_OPTIMIZE_WEBHOOK || `${N8N_BASE_URL}/webhook/optimize`;
const N8N_ORCHESTRATE_WEBHOOK = process.env.N8N_ORCHESTRATE_WEBHOOK || `${N8N_BASE_URL}/webhook/orchestrate`;
const N8N_ANALYZE_WEBHOOK = process.env.N8N_ANALYZE_WEBHOOK || `${N8N_BASE_URL}/webhook/analyze`;

// Types for n8n requests and responses
export interface OptimizeRequest {
    prompt: string;
    targetModel: 'chatgpt' | 'claude' | 'gemini' | 'cursor' | 'universal';
    strength: 'light' | 'medium' | 'aggressive';
    context?: string;
}

export interface OrchestrationRequest extends OptimizeRequest {
    orchestration?: {
        enabled: boolean;
        maxSegments?: number;
    };
}

export interface OptimizeResponse {
    success: boolean;
    data?: {
        optimizedPrompt: string;
        improvements: string[];
        metrics: {
            originalTokens: number;
            optimizedTokens: number;
            complexityScore: number;
        };
    };
    error?: string;
}

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
 * Call n8n optimize webhook
 */
export async function callOptimize(request: OptimizeRequest): Promise<OptimizeResponse> {
    try {
        const response = await fetch(N8N_OPTIMIZE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
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
