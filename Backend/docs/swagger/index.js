import { adminPaths } from "./paths/admin.swagger.js";
import { analyticsPaths } from "./paths/analytics.swagger.js";
import { authPaths } from "./paths/auth.swagger.js";
import { healthPaths } from "./paths/health.swagger.js";
import { paymentPaths } from "./paths/payment.swagger.js";
import { subscriptionPaths } from "./paths/subscription.swagger.js";
import { userPaths } from "./paths/user.swagger.js";
import { workflowPaths } from "./paths/workflow.swagger.js";
import { schemas } from "./schemas.js";

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Subscription Tracker API",
    version: "1.0.0",
    description:
      "API documentation for authentication, subscriptions, payments, analytics, admin, health checks, and workflows.",
  },
  servers: [
    {
      url: "/api/v-1",
      description: "Current server",
    },
    {
      url: "http://localhost:5050/api/v-1",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Auth", description: "Signup, login, logout, and password reset" },
    { name: "Users", description: "Current user profile management" },
    { name: "Subscriptions", description: "Subscription CRUD and exports" },
    { name: "Payments", description: "Stripe checkout and verification" },
    { name: "Analytics", description: "User analytics" },
    { name: "Admin", description: "Admin-only management APIs" },
    { name: "Health", description: "Service health checks" },
    { name: "Workflows", description: "Internal workflow endpoints" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "auth_token",
        description: "JWT auth cookie set by /auth/log-in or /auth/sign-up.",
      },
      workflowToken: {
        type: "apiKey",
        in: "header",
        name: "x-workflow-token",
        description: "Internal token for workflow callbacks.",
      },
    },
    schemas,
  },
  paths: {
    ...authPaths,
    ...userPaths,
    ...subscriptionPaths,
    ...paymentPaths,
    ...analyticsPaths,
    ...adminPaths,
    ...healthPaths,
    ...workflowPaths,
  },
};
