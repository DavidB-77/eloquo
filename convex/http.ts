import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Health check route
http.route({
    path: "/health",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        console.log("[HEALTH] Pathname:", url.pathname);
        return new Response("OK", { status: 200 });
    }),
});

// Register Better Auth routes
authComponent.registerRoutes(http, createAuth);

export default http;
