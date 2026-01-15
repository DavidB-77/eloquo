import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { dodoWebhookHandler } from "./dodopayments";
import { components } from "./_generated/api";

const http = httpRouter();

// Register Better Auth routes
authComponent.registerRoutes(http, createAuth);

// Register Dodo Payments webhook route
// This expects DODO_PAYMENTS_WEBHOOK_SECRET to be set in the Convex dashboard
dodoWebhookHandler.registerRoutes(http, components.dodopayments);

export default http;
