import { authSecurity, commonErrors, ok } from "../helpers.js";

export const actionCenterPaths = {
  "/action-center": {
    get: {
      tags: ["Action Center"],
      summary: "Get important subscription actions for the logged-in user",
      security: authSecurity,
      responses: {
        200: ok("Action center", "#/components/schemas/ActionCenterResponse"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
};
