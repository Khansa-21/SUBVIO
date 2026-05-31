import { Client as WorkflowClient } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN } from "./env.js";

export const isWorkflowConfigured = Boolean(QSTASH_URL && QSTASH_TOKEN);

export const workflowClient = isWorkflowConfigured
  ? new WorkflowClient({
      baseUrl: QSTASH_URL,
      token: QSTASH_TOKEN,
    })
  : null;

if (!isWorkflowConfigured) {
  console.warn("Upstash not configured - subscription reminders are disabled");
}
