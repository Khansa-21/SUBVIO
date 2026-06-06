import {
  authSecurity,
  commonErrors,
  jsonBody,
  ok,
  sessionIdParam,
  created,
} from "../helpers.js";

export const paymentPaths = {
  "/payment/checkout": {
    post: {
      tags: ["Payments"],
      summary: "Create a Stripe checkout session for a subscription",
      security: authSecurity,
      requestBody: jsonBody("#/components/schemas/CheckoutInput"),
      responses: {
        200: ok("Checkout session created", "#/components/schemas/CheckoutResponse"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        503: {
          description: "Stripe is not configured",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: commonErrors.ServerError,
      },
    },
  },
  "/payment/verify/{sessionId}": {
    get: {
      tags: ["Payments"],
      summary: "Verify a paid Stripe session and create the subscription",
      security: authSecurity,
      parameters: [sessionIdParam],
      responses: {
        200: ok("Existing paid subscription returned", "#/components/schemas/SubscriptionEnvelope"),
        201: created("Paid subscription created", "#/components/schemas/SubscriptionEnvelope"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        403: commonErrors.Forbidden,
        500: commonErrors.ServerError,
      },
    },
  },
};
