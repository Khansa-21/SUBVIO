import {
  authSecurity,
  commonErrors,
  objectIdParam,
  ok,
} from "../helpers.js";

const candidateId = objectIdParam("id", "Import candidate id");

const importBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            example:
              "name,price,frequency,category,paymentMethod\nNetflix,15.99,monthly,entertainment,Visa",
          },
          items: {
            type: "array",
            items: { type: "object" },
          },
        },
      },
    },
  },
};

export const smartImportPaths = {
  "/smart-import/candidates": {
    get: {
      tags: ["Smart Import"],
      summary: "List smart import candidates",
      security: authSecurity,
      parameters: [
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["pending", "confirmed", "rejected"],
          },
        },
      ],
      responses: {
        200: ok("Import candidates", "#/components/schemas/SmartImportListResponse"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
    post: {
      tags: ["Smart Import"],
      summary: "Create smart import candidates",
      security: authSecurity,
      requestBody: importBody,
      responses: {
        201: ok("Import candidates created", "#/components/schemas/SmartImportListResponse"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
  "/smart-import/candidates/{id}": {
    patch: {
      tags: ["Smart Import"],
      summary: "Edit a pending import candidate",
      security: authSecurity,
      parameters: [candidateId],
      responses: {
        200: ok("Import candidate updated", "#/components/schemas/SmartImportEnvelope"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
  "/smart-import/candidates/{id}/confirm": {
    post: {
      tags: ["Smart Import"],
      summary: "Confirm an import candidate and create a subscription",
      security: authSecurity,
      parameters: [candidateId],
      responses: {
        201: ok("Import candidate confirmed", "#/components/schemas/SmartImportConfirmResponse"),
        400: commonErrors.BadRequest,
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        409: commonErrors.Conflict,
        500: commonErrors.ServerError,
      },
    },
  },
  "/smart-import/candidates/{id}/reject": {
    patch: {
      tags: ["Smart Import"],
      summary: "Reject a pending import candidate",
      security: authSecurity,
      parameters: [candidateId],
      responses: {
        200: ok("Import candidate rejected", "#/components/schemas/SmartImportEnvelope"),
        401: commonErrors.Unauthorized,
        404: commonErrors.NotFound,
        500: commonErrors.ServerError,
      },
    },
  },
};
