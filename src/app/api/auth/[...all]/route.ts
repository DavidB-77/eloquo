// Better Auth API Route Handler
// Proxies auth requests from Next.js to Convex

import { handler } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// Ensure the route is dynamic
export const dynamic = "force-dynamic";

// Helper to sanitize headers and create a safe request object
const getSafeRequest = (request: Request): Request => {
    const headers = new Headers(request.headers);
    // 'connection' header can cause "invalid connection header" errors in node's fetch/undici
    headers.delete("connection");

    return new Request(request.url, {
        method: request.method,
        headers: headers,
        body: request.body,
        duplex: "half", // Required for streaming bodies in Node environments
    } as any);
};

// Wrap handler to add debugging and sanitization
export async function GET(request: Request) {
    console.log("[Auth Route] GET request to:", request.url);

    // If handler exists and returns a response, use it
    if (handler?.GET) {
        try {
            const safeReq = getSafeRequest(request);
            const response = await handler.GET(safeReq);
            console.log("[Auth Route] Handler response status:", response?.status);
            return response;
        } catch (error) {
            console.error("[Auth Route] Handler error:", error);
            return NextResponse.json({ error: "Auth handler error" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "No handler available" }, { status: 404 });
}

export async function POST(request: Request) {
    console.log("[Auth Route] POST request to:", request.url);

    if (handler?.POST) {
        try {
            const safeReq = getSafeRequest(request);
            const response = await handler.POST(safeReq);
            console.log("[Auth Route] Handler response status:", response?.status);
            return response;
        } catch (error) {
            console.error("[Auth Route] Handler error:", error);
            return NextResponse.json({ error: "Auth handler error" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "No handler available" }, { status: 404 });
}
