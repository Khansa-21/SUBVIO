import {
  authSecurity,
  commonErrors,
  objectIdParam,
  ok,
} from "../helpers.js";

const userId = objectIdParam("id", "User id");
const subscriptionId = objectIdParam("id", "Subscription id");

const roleBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: ["user", "admin"], example: "admin" },
        },
      },
    },
  },
};

export const adminPaths = {
  "/admin/dashboard": {
    get: {
      tags: ["Admin"],
      summary: "Get admin dashboard metrics",
      security: authSecurity,
      responses: {
        200: ok("Admin dashboard", "#/components/schemas/AdminDashboardResponse"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/users": {
    get: {
      tags: ["Admin"],
      summary: "List all users",
      security: authSecurity,
      responses: {
        200: {
          description: "Users list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  count: { type: "number", example: 1 },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
        },
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/users/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Get a user by id",
      security: authSecurity,
      parameters: [userId],
      responses: {
        200: ok("User details", "#/components/schemas/UserEnvelope"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete a user and their subscriptions",
      security: authSecurity,
      parameters: [userId],
      responses: {
        200: ok("User deleted", "#/components/schemas/MessageResponse"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/users/{id}/role": {
    patch: {
      tags: ["Admin"],
      summary: "Update a user's role",
      security: authSecurity,
      parameters: [userId],
      requestBody: roleBody,
      responses: {
        200: ok("User role updated", "#/components/schemas/UserEnvelope"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/users/{id}/subscriptions": {
    get: {
      tags: ["Admin"],
      summary: "List subscriptions for a user",
      security: authSecurity,
      parameters: [userId],
      responses: {
        200: ok("User subscriptions", "#/components/schemas/SubscriptionListResponse"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/subscriptions": {
    get: {
      tags: ["Admin"],
      summary: "List all subscriptions",
      security: authSecurity,
      responses: {
        200: ok("Subscriptions list", "#/components/schemas/SubscriptionListResponse"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/subscriptions/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Get any subscription by id",
      security: authSecurity,
      parameters: [subscriptionId],
      responses: {
        200: ok("Subscription details", "#/components/schemas/SubscriptionEnvelope"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
    delete: {
      tags: ["Admin"],
      summary: "Delete any subscription by id",
      security: authSecurity,
      parameters: [subscriptionId],
      responses: {
        200: ok("Subscription deleted", "#/components/schemas/MessageResponse"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/admin/subscriptions/{id}/cancel": {
    patch: {
      tags: ["Admin"],
      summary: "Cancel any subscription by id",
      security: authSecurity,
      parameters: [subscriptionId],
      responses: {
        200: ok("Subscription cancelled", "#/components/schemas/SubscriptionEnvelope"),
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
};
