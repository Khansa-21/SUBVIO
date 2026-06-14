import {
  authSecurity,
  commonErrors,
  jsonBody,
  objectIdParam,
  ok,
  created,
} from "../helpers.js";

const subscriptionId = objectIdParam("id", "Subscription id");

export const subscriptionPaths = {
  "/subscription": {
    get: {
      tags: ["Subscriptions"],
      summary: "List the logged-in user's subscriptions",
      security: authSecurity,
      responses: {
        200: ok("Subscription list", "#/components/schemas/SubscriptionListResponse"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
    post: {
      tags: ["Subscriptions"],
      summary: "Create a subscription",
      security: authSecurity,
      requestBody: jsonBody("#/components/schemas/SubscriptionInput"),
      responses: {
        201: created("Subscription created", "#/components/schemas/SubscriptionEnvelope"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        409: commonErrors.Conflict,
        500: commonErrors.ServerError,
      },
    },
  },
  "/subscription/search/filter": {
    get: {
      tags: ["Subscriptions"],
      summary: "Search and filter subscriptions",
      security: authSecurity,
      parameters: [
        { name: "q", in: "query", schema: { type: "string" } },
        { name: "name", in: "query", schema: { type: "string" } },
        { name: "category", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["active", "cancelled", "expired"] },
        },
        { name: "minPrice", in: "query", schema: { type: "number" } },
        { name: "maxPrice", in: "query", schema: { type: "number" } },
        { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
        { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
      ],
      responses: {
        200: ok("Filtered subscriptions", "#/components/schemas/SubscriptionListResponse"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
  "/subscription/export": {
    get: {
      tags: ["Subscriptions"],
      summary: "Export subscriptions as CSV or JSON",
      security: authSecurity,
      parameters: [
        {
          name: "format",
          in: "query",
          schema: { type: "string", enum: ["csv", "json"], default: "csv" },
        },
      ],
      responses: {
        200: {
          description: "Exported subscriptions",
          content: {
            "text/csv": {
              schema: {
                type: "string",
              },
            },
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/Subscription" },
              },
            },
          },
        },
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
  "/subscription/upcoming": {
    get: {
      tags: ["Subscriptions"],
      summary: "List renewals due in the next 7 days",
      security: authSecurity,
      responses: {
        200: ok("Upcoming renewals", "#/components/schemas/SubscriptionListResponse"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
  "/subscription/{id}": {
    get: {
      tags: ["Subscriptions"],
      summary: "Get one subscription",
      security: authSecurity,
      parameters: [subscriptionId],
      responses: {
        200: ok("Subscription details", "#/components/schemas/SubscriptionEnvelope"),
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
    patch: {
      tags: ["Subscriptions"],
      summary: "Update a subscription",
      security: authSecurity,
      parameters: [subscriptionId],
      requestBody: jsonBody("#/components/schemas/SubscriptionUpdateInput"),
      responses: {
        200: ok("Subscription updated", "#/components/schemas/SubscriptionEnvelope"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        409: commonErrors.Conflict,
        500: commonErrors.ServerError,
      },
    },
    delete: {
      tags: ["Subscriptions"],
      summary: "Delete a subscription",
      security: authSecurity,
      parameters: [subscriptionId],
      responses: {
        200: ok("Subscription deleted", "#/components/schemas/MessageResponse"),
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/subscription/{id}/cancel": {
    patch: {
      tags: ["Subscriptions"],
      summary: "Cancel a subscription",
      security: authSecurity,
      parameters: [subscriptionId],
      responses: {
        200: ok("Subscription cancelled", "#/components/schemas/SubscriptionEnvelope"),
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
};
