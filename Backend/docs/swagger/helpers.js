export const authSecurity = [{ cookieAuth: [] }];
export const workflowSecurity = [{ workflowToken: [] }];

export const objectIdParam = (name, description) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: {
    type: "string",
    example: "665f1b9a4f9b2a001f0c1234",
  },
});

export const tokenParam = {
  name: "token",
  in: "path",
  required: true,
  description: "Password reset token received by email",
  schema: {
    type: "string",
  },
};

export const sessionIdParam = {
  name: "sessionId",
  in: "path",
  required: true,
  description: "Stripe checkout session id",
  schema: {
    type: "string",
    example: "cs_test_a1b2c3",
  },
};

export const jsonBody = (schemaRef, required = true) => ({
  required,
  content: {
    "application/json": {
      schema: {
        $ref: schemaRef,
      },
    },
  },
});

export const ok = (description, schemaRef) => response(200, description, schemaRef);
export const created = (description, schemaRef) =>
  response(201, description, schemaRef);

export const response = (_status, description, schemaRef) => ({
  description,
  ...(schemaRef && {
    content: {
      "application/json": {
        schema: {
          $ref: schemaRef,
        },
      },
    },
  }),
});

export const noContent = (description) => ({
  description,
});

export const commonErrors = {
  BadRequest: {
    description: "Invalid request",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
  Unauthorized: {
    description: "Authentication is required or invalid",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
  Forbidden: {
    description: "You do not have permission to perform this action",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
  NotFound: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
  Conflict: {
    description: "Duplicate resource or conflicting state",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
  ServerError: {
    description: "Server error",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  },
};
