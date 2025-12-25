import { callEloquoAPI } from "../api/client.js";

export const usageTool = {
    name: "eloquo_usage",
    description:
        "Check your Eloquo subscription status and remaining credits.",
    inputSchema: {
        type: "object" as const,
        properties: {},
        required: [],
    },
};

export async function handleUsage() {
    const result = await callEloquoAPI("/usage");

    if (!result.success) {
        throw new Error(result.error?.message || "Failed to get usage");
    }

    const data = result.data;

    let response = `📊 YOUR ELOQUO STATUS\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    response += `Plan: ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}\n`;
    response += `Status: ${data.status}\n\n`;
    response += `Usage This Month:\n`;
    response += `• Optimizations: ${data.optimizations.used} / ${data.optimizations.limit}\n`;
    response += `• Premium Credits: ${data.premiumCredits.used} / ${data.premiumCredits.limit}\n\n`;
    response += `Remaining:\n`;
    response += `• ${data.optimizations.remaining} optimizations\n`;
    response += `• ${data.premiumCredits.remaining} premium credits\n`;

    if (data.billingCycle) {
        response += `\n📅 ${data.billingCycle.daysRemaining} days until renewal`;
    }

    return {
        content: [{ type: "text", text: response }],
    };
}
