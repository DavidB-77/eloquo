// Convex App Configuration
// This file configures all Convex components used in the application

import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config.js";
import betterAuth from "@convex-dev/better-auth/convex.config";
import dodoPayments from "@dodopayments/convex/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();

// Email component for transactional emails
app.use(resend);

// Authentication component
app.use(betterAuth);

// Payment component
app.use(dodoPayments);

// Rate Limiter
app.use(rateLimiter);

export default app;
