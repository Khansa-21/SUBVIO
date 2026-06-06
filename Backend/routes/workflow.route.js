import { Router } from "express";
import { sendReminders } from "../controllers/workflow.controller.js";
import { QSTASH_TOKEN } from "../config/env.js";
import HttpError from "../utils/httpError.js";

const workflowRouter = Router();

const verifyWorkflowToken = (req, res, next) => {
  const token = req.headers["x-workflow-token"];

  if (!QSTASH_TOKEN || token !== QSTASH_TOKEN) {
    throw new HttpError(401, "Unauthorized workflow request");
  }

  next();
};

workflowRouter.post("/subscription/reminder", verifyWorkflowToken, sendReminders);

export default workflowRouter;
