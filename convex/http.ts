import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();

// Temporary Admin Route for User Deletion
http.route({
    path: "/api/admin/delete-user-force",
    method: "GET",
    handler: httpAction(async (ctx, _request) => {
        const email = "dj.blaney77@gmail.com";
        console.log(`[ADMIN] Force deleting user: ${email}`);

        await ctx.runMutation(api.admin_utils.deleteUserByEmail, { email });

        return new Response(`Deleted user ${email} successfully`, { status: 200 });
    }),
});

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
