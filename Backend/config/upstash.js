import { Client as WorkflowClient } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN } from "./env.js";

if (!QSTASH_URL || !QSTASH_TOKEN) {
  console.log("⚠️ Upstash not configured - skipping workflow setup");
}

export const workflowClient = new WorkflowClient({
  baseUrl: QSTASH_URL,
  token: QSTASH_TOKEN,
});
