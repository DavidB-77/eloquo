#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
    optimizeTool,
    handleOptimize,
    orchestrateTool,
    handleOrchestrate,
    analyzeTool,
    handleAnalyze,
    usageTool,
    handleUsage,
} from "./tools/index.js";

const server = new Server(
    {
        name: "eloquo",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [optimizeTool, orchestrateTool, analyzeTool, usageTool],
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "eloquo_optimize":
                return await handleOptimize(args || {});
            case "eloquo_orchestrate":
                return await handleOrchestrate(args || {});
            case "eloquo_analyze":
                return await handleAnalyze(args || {});
            case "eloquo_usage":
                return await handleUsage();
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            content: [{ type: "text", text: `Error: ${message}` }],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Eloquo MCP Server running");
}

main().catch(console.error);
