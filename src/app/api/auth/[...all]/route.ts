// Better Auth API Route Handler
// Proxies auth requests from Next.js to Convex

import { handler } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// Ensure the route is dynamic
export const dynamic = "force-dynamic";

// Wrap handler to add debugging
export async function GET(request: Request) {
    console.log("[Auth Route] GET request to:", request.url);

    // If handler exists and returns a response, use it
    if (handler?.GET) {
        try {
            const response = await handler.GET(request);
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
            const response = await handler.POST(request);
            console.log("[Auth Route] Handler response status:", response?.status);
            return response;
        } catch (error) {
            console.error("[Auth Route] Handler error:", error);
            return NextResponse.json({ error: "Auth handler error" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "No handler available" }, { status: 404 });
}
