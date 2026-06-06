import {
  commonErrors,
  jsonBody,
  noContent,
  workflowSecurity,
} from "../helpers.js";

export const workflowPaths = {
  "/workflows/subscription/reminder": {
    post: {
      tags: ["Workflows"],
      summary: "Trigger subscription reminder workflow",
      description:
        "Internal endpoint used by Upstash Workflow. Requires the x-workflow-token header.",
      security: workflowSecurity,
      requestBody: jsonBody("#/components/schemas/WorkflowReminderInput"),
      responses: {
        200: noContent("Workflow request accepted"),
        401: commonErrors.Unauthorized,
        500: commonErrors.ServerError,
      },
    },
  },
};
