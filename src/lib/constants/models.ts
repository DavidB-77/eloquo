export const TARGET_MODELS = [
    { value: 'universal', label: 'Universal (All Models)', icon: '🌐', accuracy: 96 },
    { value: 'gpt-5', label: 'GPT-5 / GPT-5.2', icon: '🟢', accuracy: 99 },
    { value: 'gpt-4o', label: 'GPT-4o', icon: '🟢', accuracy: 99 },
    { value: 'claude-opus', label: 'Claude Opus 4.5', icon: '🟠', accuracy: 98 },
    { value: 'claude-sonnet', label: 'Claude Sonnet 4.5', icon: '🟠', accuracy: 98 },
    { value: 'gemini-3-pro', label: 'Gemini 3 Pro', icon: '🔵', accuracy: 98 },
    { value: 'gemini-3-flash', label: 'Gemini 3 Flash', icon: '🔵', accuracy: 98 },
    { value: 'deepseek', label: 'DeepSeek V3 / R1', icon: '🔴', accuracy: 97 },
    { value: 'llama-4', label: 'Llama 4', icon: '🦙', accuracy: 97 },
    { value: 'mistral', label: 'Mistral Large 3', icon: '🌊', accuracy: 97 },
    { value: 'qwen', label: 'Qwen 3', icon: '🐼', accuracy: 97 },
    { value: 'grok', label: 'Grok 3', icon: '⚡', accuracy: 95 },
] as const;

export type TargetModel = typeof TARGET_MODELS[number]['value'];

export function getModelAccuracy(model: string): number {
    const found = TARGET_MODELS.find(m => m.value === model);
    return found?.accuracy || 95;
}
