import { commonErrors, ok } from "../helpers.js";

export const healthPaths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Check API health",
      responses: {
        200: ok("API health", "#/components/schemas/HealthResponse"),
      },
    },
  },
  "/health/db": {
    get: {
      tags: ["Health"],
      summary: "Check database connection state",
      responses: {
        200: ok("Database health", "#/components/schemas/DatabaseHealthResponse"),
        500: commonErrors.ServerError,
      },
    },
  },
};
