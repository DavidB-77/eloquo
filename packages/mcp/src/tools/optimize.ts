import { callEloquoAPI } from "../api/client.js";

export const optimizeTool = {
    name: "eloquo_optimize",
    description:
        "Optimize a prompt for better AI results. Returns an improved version tailored for the target AI platform.",
    inputSchema: {
        type: "object" as const,
        properties: {
            prompt: {
                type: "string",
                description: "The prompt to optimize",
            },
            targetModel: {
                type: "string",
                enum: ["chatgpt", "claude", "gemini", "cursor", "universal"],
                description: "Which AI platform to optimize for (default: universal)",
            },
            strength: {
                type: "string",
                enum: ["light", "medium", "aggressive"],
                description: "How much to modify the prompt (default: medium)",
            },
            context: {
                type: "string",
                description: "Optional additional context about what you're trying to do",
            },
        },
        required: ["prompt"],
    },
};

export async function handleOptimize(args: Record<string, unknown>) {
    const result = await callEloquoAPI("/optimize", {
        prompt: args.prompt,
        targetModel: args.targetModel || "universal",
        strength: args.strength || "medium",
        context: args.context,
    });

    if (!result.success) {
        throw new Error(result.error?.message || "Optimization failed");
    }

    const data = result.data;

    let response = `✨ OPTIMIZED PROMPT:\n\n${data.optimizedPrompt}\n\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    response += `📈 Improvements:\n`;
    data.improvements?.forEach((imp: string) => {
        response += `• ${imp}\n`;
    });

    return {
        content: [{ type: "text", text: response }],
    };
}
