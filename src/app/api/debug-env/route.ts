import { NextResponse } from "next/server";
import { handler } from "@/lib/auth-server";

export async function GET() {
    return NextResponse.json({
        NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
        NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
        handlerType: typeof handler,
        handlerKeys: handler ? Object.keys(handler) : [],
        handlerIsFunction: typeof handler === "function",
        SITE_URL: process.env.SITE_URL,
        NODE_ENV: process.env.NODE_ENV,
    });
}
