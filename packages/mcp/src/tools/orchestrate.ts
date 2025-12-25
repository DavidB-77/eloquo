import { callEloquoAPI } from "../api/client.js";

export const orchestrateTool = {
    name: "eloquo_orchestrate",
    description:
        "Break a complex request into multiple focused prompts. Returns a workflow of targeted prompts for different stages/platforms.",
    inputSchema: {
        type: "object" as const,
        properties: {
            prompt: {
                type: "string",
                description: "The complex request to break into segments",
            },
            maxSegments: {
                type: "number",
                description: "Maximum number of segments to create (default: 6)",
            },
        },
        required: ["prompt"],
    },
};

export async function handleOrchestrate(args: Record<string, unknown>) {
    const result = await callEloquoAPI("/orchestrate", {
        prompt: args.prompt,
        orchestration: {
            enabled: true,
            maxSegments: args.maxSegments || 6,
        },
    });

    if (!result.success) {
        throw new Error(result.error?.message || "Orchestration failed");
    }

    const data = result.data;

    let response = `📋 ORCHESTRATION PLAN: ${data.summary}\n\n`;
    response += `Total Segments: ${data.totalSegments}\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    data.segments?.forEach((seg: any) => {
        response += `SEGMENT ${seg.order}: ${seg.name}\n`;
        response += `Platform: ${seg.targetPlatform} | Purpose: ${seg.purpose}\n`;
        response += `─────────────────────────────────────────\n`;
        response += `${seg.prompt}\n\n`;
        response += `📝 ${seg.instructions}\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    return {
        content: [{ type: "text", text: response }],
    };
}
