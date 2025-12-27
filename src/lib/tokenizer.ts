import { encode } from 'gpt-tokenizer';
import { getModelAccuracy } from './constants/models';

/**
 * Count tokens using GPT tokenizer (reasonable approximation for all models)
 * Different models tokenize slightly differently, but GPT's tokenizer
 * provides a good baseline estimate.
 */
export function countTokens(text: string): number {
    if (!text) return 0;
    try {
        return encode(text).length;
    } catch (error) {
        // Fallback: rough estimate (1 token ≈ 4 characters)
        console.warn('Tokenizer fallback used:', error);
        return Math.ceil(text.length / 4);
    }
}

/**
 * Calculate token savings between original and optimized text
 */
export function calculateTokenSavings(
    originalText: string,
    optimizedText: string,
    targetModel: string
): {
    original: number;
    optimized: number;
    saved: number;
    savingsPercent: number;
    accuracy: number;
} {
    const original = countTokens(originalText);
    const optimized = countTokens(optimizedText);
    const saved = Math.max(0, original - optimized); // Ensure non-negative
    const savingsPercent = original > 0 ? Math.round((saved / original) * 100) : 0;
    const accuracy = getModelAccuracy(targetModel);

    return {
        original,
        optimized,
        saved,
        savingsPercent,
        accuracy,
    };
}
