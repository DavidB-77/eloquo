import { callEloquoAPI } from "../api/client.js";

export const analyzeTool = {
    name: "eloquo_analyze",
    description:
        "Analyze a prompt without optimizing it. See complexity, domains, and recommendations. Free - uses no credits.",
    inputSchema: {
        type: "object" as const,
        properties: {
            prompt: {
                type: "string",
                description: "The prompt to analyze",
            },
        },
        required: ["prompt"],
    },
};

export async function handleAnalyze(args: Record<string, unknown>) {
    const result = await callEloquoAPI("/analyze", {
        prompt: args.prompt,
    });

    if (!result.success) {
        throw new Error(result.error?.message || "Analysis failed");
    }

    const data = result.data;

    let response = `🔍 ANALYSIS RESULTS\n\n`;
    response += `Complexity: ${data.complexity}\n`;
    response += `Domains: ${data.domains?.join(", ") || "General"}\n`;
    response += `Suggested Model: ${data.suggestedModel || "Universal"}\n\n`;

    if (data.recommendations?.length > 0) {
        response += `💡 Recommendations:\n`;
        data.recommendations.forEach((rec: string) => {
            response += `• ${rec}\n`;
        });
    }

    response += `\nWould Orchestrate: ${data.shouldOrchestrate ? "Yes" : "No"}`;
    response += `\n\n💳 Credits: FREE (analysis doesn't use credits)`;

    return {
        content: [{ type: "text", text: response }],
    };
}
