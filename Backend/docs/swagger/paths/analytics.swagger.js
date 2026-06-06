import { authSecurity, commonErrors, ok } from "../helpers.js";

export const analyticsPaths = {
  "/analytics/monthly": {
    get: {
      tags: ["Analytics"],
      summary: "Get monthly subscription spend for the logged-in user",
      security: authSecurity,
      responses: {
        200: ok("Monthly analytics", "#/components/schemas/MonthlyAnalyticsResponse"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
};
